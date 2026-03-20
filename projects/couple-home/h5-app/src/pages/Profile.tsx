import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

export default function Profile() {
  const { settings, loadSettings, updateSettings } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    partnerNickname: '',
    avatar: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setEditForm({
        nickname: settings.nickname,
        partnerNickname: settings.partnerNickname,
        avatar: settings.avatar,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(editForm);
    setIsEditing(false);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">💕</div>
          <p className="text-white text-lg font-heading">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="我的" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 头像和昵称 */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-3 bg-white rounded-full flex items-center justify-center text-5xl shadow-md">
            {settings.avatar}
          </div>
          <h2 className="text-white text-xl font-heading font-semibold">
            {settings.nickname}
          </h2>
          <p className="text-white/80 text-sm">
            💕 与 {settings.partnerNickname} 的同居生活
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="bg-white rounded-md p-4 shadow-md">
          <h3 className="font-heading font-semibold text-gray-800 mb-3">
            📊 我的数据
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-dark">92%</p>
              <p className="text-xs text-gray-500">投票参与</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-dark">85%</p>
              <p className="text-xs text-gray-500">家务完成</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-dark">100%</p>
              <p className="text-xs text-gray-500">账单准时</p>
            </div>
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="bg-white rounded-md shadow-md overflow-hidden">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <span className="text-gray-700">主题装扮</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <span className="text-gray-700">通知设置</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💾</span>
                <span className="text-gray-700">数据备份</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❓</span>
                <span className="text-gray-700">帮助与反馈</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">ℹ️</span>
                <span className="text-gray-700">关于我们</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>

        {/* 编辑资料 */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full btn btn-secondary"
        >
          {isEditing ? '取消编辑' : '编辑资料'}
        </button>

        {/* 退出登录 */}
        <button className="w-full btn btn-ghost text-red-500">
          🚪 退出登录
        </button>

        {/* 编辑表单 */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-sm p-6 animate-fade-in">
              <h3 className="text-lg font-heading font-semibold mb-4">编辑资料</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    你的昵称
                  </label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    对方昵称
                  </label>
                  <input
                    type="text"
                    value={editForm.partnerNickname}
                    onChange={(e) => setEditForm({ ...editForm, partnerNickname: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    头像 Emoji
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {['🧚‍♀️', '👸', '👧', '👩', '🧑‍🎤', '🧔', '👨', '🧒', '👶', '🦸'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setEditForm({ ...editForm, avatar: emoji })}
                        className={`text-3xl p-2 rounded-md transition-all ${
                          editForm.avatar === emoji
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn btn-ghost"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 btn btn-primary"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <TabBar activeTab="profile" />
    </div>
  );
}
