import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import TabBar from '../components/TabBar';
import Header from '../components/Header';
import AnniversaryCard from '../components/AnniversaryCard';
import VoteCard from '../components/VoteCard';
import QuickActions from '../components/QuickActions';

export default function Home() {
  const { 
    settings, 
    loadSettings, 
    loadVotes, 
    loadChores, 
    loadBills,
    loadAnniversaries,
    votes,
    chores,
    bills,
    anniversaries,
    calculateDaysTogether,
  } = useAppStore();

  useEffect(() => {
    loadSettings();
    loadVotes();
    loadChores();
    loadBills();
    loadAnniversaries();
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">💕</div>
          <p className="text-white text-lg font-heading">加载中，马上就好~</p>
        </div>
      </div>
    );
  }

  const pendingChores = chores.filter(c => c.status === 'pending').length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const activeVotes = votes.filter(v => v.status === 'pending').length;

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header title="我们的小家" showNotification />
      
      <div className="px-4 py-6 space-y-6">
        {/* 问候 */}
        <div className="text-white">
          <p className="text-lg mb-1">👋 早上好，{settings.nickname} 💕</p>
          <p className="text-white/80">
            {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>

        {/* 纪念日卡片 */}
        {anniversaries.length > 0 && (
          <AnniversaryCard 
            anniversary={anniversaries[0]}
            daysTogether={calculateDaysTogether(anniversaries[0].date)}
          />
        )}

        {/* 今天吃什么 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-lg font-heading font-semibold">
              🍽️ 今天吃什么？
            </h2>
            {activeVotes > 0 && (
              <span className="bg-white/30 text-white text-xs px-2 py-1 rounded-full">
                {activeVotes} 个投票中
              </span>
            )}
          </div>
          
          {votes.filter(v => v.status === 'pending').length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {votes.filter(v => v.status === 'pending').map(vote => (
                <VoteCard key={vote.id} vote={vote} />
              ))}
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white">
              <p className="text-4xl mb-2">🌸</p>
              <p className="text-sm">还没有投票哦</p>
              <p className="text-xs opacity-80">点击上方 + 创建第一个投票</p>
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div>
          <h2 className="text-white text-lg font-heading font-semibold mb-3">
            📋 待办事项
          </h2>
          <QuickActions
            pendingChores={pendingChores}
            pendingBills={pendingBills}
          />
        </div>

        {/* 统计 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-md p-4">
          <h3 className="text-white font-heading font-semibold mb-3">📊 我的数据</h3>
          <div className="grid grid-cols-3 gap-3 text-center text-white text-sm">
            <div>
              <p className="text-2xl font-bold">{votes.length}</p>
              <p className="opacity-80">总投票</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{chores.filter(c => c.status === 'completed').length}</p>
              <p className="opacity-80">完成家务</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{bills.filter(b => b.status === 'confirmed').length}</p>
              <p className="opacity-80">确认账单</p>
            </div>
          </div>
        </div>
      </div>

      <TabBar activeTab="home" />
    </div>
  );
}
