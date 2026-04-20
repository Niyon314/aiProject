import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

// WebSocket 消息类型
export interface WSMessage {
  type: 'message' | 'notification' | 'system';
  from?: string;
  to?: string;
  content: any;
}

// WebSocket 回调类型
interface WSCallbacks {
  onMessage?: (message: WSMessage) => void;
  onNotification?: (notification: WSMessage) => void;
  onSystem?: (system: WSMessage) => void;
}

// WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

/**
 * WebSocket Hook
 * @param callbacks 消息回调函数
 * @param autoConnect 是否自动连接
 */
export function useWebSocket(callbacks?: WSCallbacks, autoConnect: boolean = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { isAuthenticated } = useAuthStore();

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated) {
      console.log('[WS] 未登录，跳过连接');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WS] 已连接');
      return;
    }

    try {
      console.log('[WS] 开始连接:', WS_URL);
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('[WS] 连接成功');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          console.log('[WS] 收到消息:', message);

          // 根据消息类型调用回调
          switch (message.type) {
            case 'message':
              callbacks?.onMessage?.(message);
              break;
            case 'notification':
              callbacks?.onNotification?.(message);
              break;
            case 'system':
              callbacks?.onSystem?.(message);
              break;
            default:
              console.log('[WS] 未知消息类型:', message.type);
          }
        } catch (error) {
          console.error('[WS] 解析消息失败:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[WS] 错误:', error);
      };

      wsRef.current.onclose = () => {
        console.log('[WS] 连接关闭，5 秒后重连...');
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isAuthenticated) {
            connect();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('[WS] 连接失败:', error);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [isAuthenticated, callbacks]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      console.log('[WS] 已断开连接');
    }
  }, []);

  // 发送消息
  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('[WS] 发送消息:', message);
    } else {
      console.warn('[WS] 连接未打开，无法发送消息');
    }
  }, []);

  // 自动连接
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, connect, disconnect]);

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    connect,
    disconnect,
  };
}
