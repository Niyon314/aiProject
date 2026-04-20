import React, { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Notification {
  id: string;
  type: 'new_message' | 'vote_update' | 'schedule_reminder';
  title: string;
  message: string;
  icon: string;
  timestamp: number;
  data?: any;
}

interface WSNotificationProps {
  userId: string;
  wsUrl?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export const WSNotification: React.FC<WSNotificationProps> = ({
  userId,
  wsUrl,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showBadge, setShowBadge] = useState(false);

  // 处理 WebSocket 消息
  const handleMessage = useCallback((message: any) => {
    const { type, content } = message;
    let notification: Notification | null = null;

    switch (type) {
      case 'new_message':
        notification = {
          id: `msg_${Date.now()}`,
          type: 'new_message',
          title: '新留言 💕',
          message: `${content.senderName}: ${content.content}`,
          icon: '💬',
          timestamp: content.timestamp,
          data: content,
        };
        break;

      case 'vote_update':
        notification = {
          id: `vote_${Date.now()}`,
          type: 'vote_update',
          title: content.matchSuccess ? '投票匹配成功！💕' : '投票结果已出',
          message: content.matchSuccess
            ? `你们都想吃 ${content.resultName}！`
            : '投票已完成，查看结果吧',
          icon: content.matchSuccess ? '🎉' : '🍽️',
          timestamp: content.timestamp,
          data: content,
        };
        break;

      case 'schedule_reminder':
        notification = {
          id: `schedule_${Date.now()}`,
          type: 'schedule_reminder',
          title: '日程提醒 📅',
          message: `${content.icon} ${content.title}`,
          icon: '⏰',
          timestamp: content.timestamp,
          data: content,
        };
        break;

      default:
        console.log('[WS Notification] 未知消息类型:', type);
    }

    if (notification) {
      setNotifications((prev) => [notification!, ...prev].slice(0, 10)); // 最多保留 10 条
      setShowBadge(true);

      // 自动播放提示音（可选）
      playNotificationSound();
    }
  }, []);

  // 播放提示音
  const playNotificationSound = () => {
    // 简单的提示音，可以使用 Web Audio API 或音频文件
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.log('[WS Notification] 无法播放提示音:', err);
    }
  };

  // 初始化 WebSocket
  const { connected, disconnect } = useWebSocket({
    url: wsUrl || 'ws://localhost:8080/ws',
    userId,
    onMessage: handleMessage,
  });

  // 清除通知
  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notifications.length <= 1) {
      setShowBadge(false);
    }
  }, [notifications.length]);

  // 清除所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setShowBadge(false);
  }, []);

  // 处理通知点击
  const handleNotificationClick = useCallback((notification: Notification) => {
    onNotificationClick?.(notification);
    clearNotification(notification.id);
  }, [onNotificationClick, clearNotification]);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className="ws-notification-container">
      {/* 通知铃铛图标 */}
      <div className="notification-bell" onClick={clearAllNotifications}>
        <span className="bell-icon">🔔</span>
        {showBadge && <span className="notification-badge">!</span>}
      </div>

      {/* 通知列表 */}
      {notifications.length > 0 && (
        <div className="notification-list">
          <div className="notification-header">
            <span>通知</span>
            <button className="clear-all" onClick={clearAllNotifications}>
              全部清除
            </button>
          </div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="notification-item"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">{notification.icon}</div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {formatTime(notification.timestamp)}
                </div>
              </div>
              <button
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notification.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ws-notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
        }

        .notification-bell {
          position: relative;
          cursor: pointer;
          font-size: 24px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s;
        }

        .notification-bell:hover {
          transform: scale(1.1);
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ff4757;
          color: white;
          font-size: 12px;
          font-weight: bold;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .notification-list {
          position: absolute;
          top: 50px;
          right: 0;
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          font-weight: bold;
          color: #333;
        }

        .clear-all {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .clear-all:hover {
          background: #f5f5f5;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: 12px 16px;
          border-bottom: 1px solid #f5f5f5;
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: #f9f9f9;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-icon {
          font-size: 24px;
          margin-right: 12px;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .notification-message {
          color: #666;
          font-size: 14px;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .notification-time {
          color: #999;
          font-size: 12px;
        }

        .notification-close {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          line-height: 1;
          transition: color 0.2s;
        }

        .notification-close:hover {
          color: #666;
        }

        @media (max-width: 768px) {
          .ws-notification-container {
            top: 10px;
            right: 10px;
          }

          .notification-list {
            width: 280px;
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

// 辅助函数：格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 少于 1 分钟
  if (diff < 60000) {
    return '刚刚';
  }

  // 少于 1 小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }

  // 少于 24 小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }

  // 少于 7 天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }

  // 显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default WSNotification;
