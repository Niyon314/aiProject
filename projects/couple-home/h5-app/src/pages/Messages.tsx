import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageApi, type Message } from '../api/messageApi';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

export default function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 加载留言列表
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getList();
      setMessages(response.messages);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('加载留言失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // 发送留言
  const handleSend = async () => {
    if (!messageContent.trim()) {
      alert('写点什么吧~ 💕');
      return;
    }

    if (messageContent.length > 200) {
      alert('留言不能超过 200 字哦~');
      return;
    }

    try {
      setSending(true);
      await messageApi.create({ content: messageContent.trim() });
      
      // 显示成功动画
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // 清空输入框
      setMessageContent('');
      
      // 重新加载列表
      await loadMessages();
    } catch (error) {
      console.error('发送留言失败:', error);
      alert('发送失败，请重试~');
    } finally {
      setSending(false);
    }
  };

  // 标记为已读
  const handleMarkAsRead = async (id: string) => {
    try {
      await messageApi.markAsRead(id);
      await loadMessages();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in" style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE5EC 100%)' }}>
      <Header title="💌 留言板" showNotification />
      
      <div className="px-4 py-6 space-y-6">
        {/* 发送留言区域 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-[#FFB5C5]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💕</span>
            <h2 className="text-[#FF6B81] font-heading font-semibold text-lg">写给 TA 的悄悄话</h2>
          </div>
          
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="今天想对 TA 说什么呢？💌"
            className="w-full h-32 p-3 rounded-xl border-2 border-[#FFB5C5]/50 focus:border-[#FF6B81] focus:outline-none resize-none text-gray-700 placeholder-gray-400"
            maxLength={200}
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">{messageContent.length}/200</span>
            <button
              onClick={handleSend}
              disabled={sending || !messageContent.trim()}
              className={`px-6 py-2 rounded-full font-semibold transition-all transform touch-target ${
                sending || !messageContent.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF6B81] text-white hover:bg-[#FF4757] active:scale-95'
              }`}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-heart-beat">💌</span>
                  发送中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  发送
                  <span>💌</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 成功动画 */}
        {showSuccess && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="text-6xl animate-bounce">💕</div>
          </div>
        )}

        {/* 历史留言列表 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-heading font-semibold text-lg flex items-center gap-2">
              <span>📝</span>
              历史留言
            </h3>
            {unreadCount > 0 && (
              <span className="bg-[#FF6B81] text-white text-xs px-3 py-1 rounded-full animate-pulse">
                {unreadCount} 条未读
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-4xl animate-heart-beat">💕</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center">
              <p className="text-5xl mb-4">💌</p>
              <p className="text-gray-600 text-lg">还没有留言哦</p>
              <p className="text-gray-500 text-sm mt-2">点击上方输入框，给 TA 写第一条留言吧~</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border-2 transition-all transform hover:scale-[1.02] touch-target ${
                    !message.isRead ? 'border-[#FF6B81]' : 'border-[#FFB5C5]/50'
                  }`}
                  onClick={() => !message.isRead && handleMarkAsRead(message.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <span className="font-semibold text-gray-800">{message.senderName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{formatTime(message.createdAt)}</span>
                      {!message.isRead ? (
                        <span className="bg-[#FF6B81] text-white text-xs px-2 py-0.5 rounded-full">
                          未读
                        </span>
                      ) : message.readAt ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span>👁️</span>
                          {formatTime(message.readAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TabBar activeTab="messages" />
    </div>
  );
}
