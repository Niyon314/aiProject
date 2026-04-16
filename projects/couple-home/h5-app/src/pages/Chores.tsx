import { useEffect, useState } from 'react';
import { useChoreStore } from '../store/choreStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import ChoreList from '../components/ChoreList';
import StatsCard from '../components/StatsCard';
import type { Chore } from '../api/choreApi';

export default function Chores() {
  const {
    chores,
    userStats,
    partnerStats,
    weekProgress,
    loadChores,
    loadStats,
    claimChore,
    completeChore,
  } = useChoreStore();
  const settings = { nickname: '��', partnerNickname: 'TA' };
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>(
    'pending'
  );
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadChores();
    loadStats();
  }, []);

  const handleClaim = async (id: string) => {
    try {
      await claimChore(id);
    } catch (error) {
      console.error('Failed to claim chore:', error);
      alert('认领失败，请重试');
    }
  };

  const handleComplete = async (
    id: string,
    proofPhoto?: string,
    notes?: string
  ) => {
    try {
      await completeChore(id, proofPhoto, notes);
      alert('🎉 打卡成功！积分已到账~');
    } catch (error) {
      console.error('Failed to complete chore:', error);
      alert('打卡失败，请重试');
    }
  };

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // 转换日期为 ISO 8601 格式
    const dueDateValue = formData.get('dueDate') as string;
    const isoDueDate = dueDateValue ? new Date(dueDateValue).toISOString() : new Date().toISOString();

    const newChore: Partial<Chore> = {
      name: formData.get('name') as string,
      icon: formData.get('icon') as string || '🧹',
      type: formData.get('type') as 'daily' | 'weekly' | 'monthly' | 'once',
      points: parseInt(formData.get('points') as string) || 10,
      dueDate: isoDueDate,
    };

    try {
      const response = await fetch(
        `/api/chores`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newChore),
        }
      );
      if (response.ok) {
        await loadChores();
        setShowAddForm(false);
        alert('✅ 任务创建成功！');
      }
    } catch (error) {
      console.error('Failed to create chore:', error);
      alert('创建失败，请重试');
    }
  };

  const pendingCount = chores.filter((c) => c.status === 'pending').length;
  const completedCount = chores.filter((c) => c.status === 'completed').length;

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
      <Header
        title="家务分工"
        showNotification
        onBack={() => window.history.back()}
      />

      <div className="px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {userStats && (
            <StatsCard
              stats={userStats}
              nickname={settings?.nickname || '我'}
              isUser={true}
            />
          )}
          {partnerStats && (
            <StatsCard
              stats={partnerStats}
              nickname={settings?.partnerNickname || 'TA'}
              isUser={false}
            />
          )}
        </div>

        {/* 周进度 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-gray-800">
              📊 本周进度
            </h3>
            <span className="text-sm font-semibold text-pink-600">
              {weekProgress.completed}/{weekProgress.total}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
              style={{
                width: `${
                  weekProgress.total > 0
                    ? (weekProgress.completed / weekProgress.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {weekProgress.total > 0 &&
            weekProgress.completed === weekProgress.total ? (
              <span className="text-pink-600 font-semibold">
                🎉 太棒了！本周任务全部完成！
              </span>
            ) : (
              `加油！还差 ${weekProgress.total - weekProgress.completed} 个任务就完成啦~`
            )}
          </p>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                : 'bg-white/70 text-gray-600 hover:bg-white'
            }`}
          >
            待完成 ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md'
                : 'bg-white/70 text-gray-600 hover:bg-white'
            }`}
          >
            已完成 ({completedCount})
          </button>
        </div>

        {/* 任务列表 */}
        <ChoreList
          chores={chores}
          userNickname={settings?.nickname || '我'}
          partnerNickname={settings?.partnerNickname || 'TA'}
          onClaim={handleClaim}
          onComplete={handleComplete}
          filter={activeTab}
        />

        {/* 添加按钮 */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="fixed bottom-[80px] right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full shadow-lg text-white text-3xl flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
        >
          ➕
        </button>

        {/* 添加表单 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end">
            <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
              <h3 className="text-lg font-heading font-bold mb-4">
                ➕ 添加家务任务
              </h3>

              <form onSubmit={handleAddChore} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    任务名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="🧹"
                    defaultValue="🧹"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    任务类型
                  </label>
                  <select
                    name="type"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="once">临时</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                    defaultValue="10"
                    min="1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-full transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 px-4 rounded-full transition-all"
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
