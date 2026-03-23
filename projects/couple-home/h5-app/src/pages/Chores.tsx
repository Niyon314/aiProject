import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { Chore } from '../utils/db';

export default function Chores() {
  const { chores, loadChores, completeChore, addChore, settings } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadChores();
  }, []);

  const pendingChores = chores.filter(c => c.status === 'pending');
  const completedChores = chores.filter(c => c.status === 'completed');

  const totalPoints = completedChores.reduce((sum, c) => sum + c.points, 0);

  const handleComplete = async (id: string) => {
    await completeChore(id);
  };

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newChore: Chore = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      icon: formData.get('icon') as string || '🧹',
      assignee: formData.get('assignee') as 'user' | 'partner',
      dueDate: formData.get('dueDate') as string,
      points: parseInt(formData.get('points') as string) || 10,
      status: 'pending',
    };

    await addChore(newChore);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="家务分工" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 进度 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-md p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="font-heading font-semibold">本周进度</p>
            <p className="text-sm">
              {completedChores.length}/{chores.length}
            </p>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${chores.length > 0 ? (completedChores.length / chores.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-sm text-white/80">
            🎉 太棒了！已完成 {completedChores.length} 项家务
          </p>
          <p className="text-xs text-white/60 mt-1">
            ⭐ 获得 {totalPoints} 积分
          </p>
        </div>

        {/* 待完成 */}
        <div>
          <h2 className="text-white text-lg font-heading font-semibold mb-3">
            待完成 ({pendingChores.length})
          </h2>
          
          {pendingChores.length > 0 ? (
            <div className="space-y-3">
              {pendingChores.map(chore => (
                <div 
                  key={chore.id}
                  className="bg-white rounded-md p-4 shadow-sm border border-primary-light"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{chore.icon}</span>
                      <div>
                        <p className="font-heading font-semibold text-gray-800">
                          {chore.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          👤 {chore.assignee === 'user' ? settings?.nickname : settings?.partnerNickname}
                          {' | '}
                          📅 {new Date(chore.dueDate).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <span className="bg-macaron-yellow text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
                      ⭐ {chore.points} 积分
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleComplete(chore.id)}
                    className="w-full btn btn-primary mt-2"
                  >
                    ✅ 完成打卡
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white">
              <p className="text-4xl mb-2">🌸</p>
              <p className="text-sm">太棒了！所有家务都已完成</p>
            </div>
          )}
        </div>

        {/* 已完成 */}
        {completedChores.length > 0 && (
          <div>
            <h2 className="text-white text-lg font-heading font-semibold mb-3">
              已完成 ({completedChores.length})
            </h2>
            <div className="space-y-2">
              {completedChores.map(chore => (
                <div 
                  key={chore.id}
                  className="bg-white/60 rounded-md p-3 border border-white/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <p className="text-gray-600 line-through">{chore.name}</p>
                      <p className="text-xs text-gray-400">
                        👤 {chore.assignee === 'user' ? settings?.nickname : settings?.partnerNickname}
                        {' | '}
                        ⭐ {chore.points} 积分
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加按钮 */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="fixed bottom-[80px] right-4 w-14 h-14 bg-gradient-to-br from-primary-dark to-primary-darker rounded-full shadow-lg text-white text-3xl flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
        >
          ➕
        </button>

        {/* 添加表单 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-lg w-full p-6 animate-slide-in">
              <h3 className="text-lg font-heading font-semibold mb-4">添加家务</h3>
              
              <form onSubmit={handleAddChore} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    家务名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input"
                    placeholder="例如：洗碗、拖地..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    图标
                  </label>
                  <input
                    type="text"
                    name="icon"
                    className="input"
                    placeholder="🧹"
                    defaultValue="🧹"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    分配给
                  </label>
                  <select
                    name="assignee"
                    className="input"
                  >
                    <option value="user">{settings?.nickname}</option>
                    <option value="partner">{settings?.partnerNickname}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="input"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    积分
                  </label>
                  <input
                    type="number"
                    name="points"
                    className="input"
                    defaultValue="10"
                    min="1"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 btn btn-ghost"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <TabBar activeTab="fridge" />
    </div>
  );
}
