import { useEffect, useRef, useCallback, useState } from 'react';

interface WSMessage {
  type: string;
  from: string;
  to?: string;
  content: any;
}

interface UseWebSocketOptions {
  url?: string;
  userId?: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  autoReconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = 'ws://localhost:8080/ws',
    userId = 'anonymous',
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 3000,
    autoReconnect = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WSMessage[]>([]);

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${url}?user=${encodeURIComponent(userId)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] 已连接');
        setConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          console.log('[WS] 收到消息:', message);
          setMessages((prev) => [...prev, message]);
          onMessage?.(message);
        } catch (err) {
          console.error('[WS] 解析消息失败:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] 连接关闭');
        setConnected(false);
        onDisconnect?.();

        // 自动重连
        if (autoReconnect && !reconnectTimeoutRef.current) {
          console.log(`[WS] 将在 ${reconnectInterval}ms 后重连...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] 错误:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] 连接失败:', err);
    }
  }, [url, userId, onMessage, onConnect, onDisconnect, reconnectInterval, autoReconnect]);

  // 发送消息
  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[WS] 连接未打开，无法发送消息');
    return false;
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 初始连接
  useEffect(() => {
    connect();
  }, [connect]);

  return {
    connected,
    messages,
    sendMessage,
    connect,
    disconnect,
    clearMessages: () => setMessages([]),
  };
}

export default useWebSocket;
