import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChoreStore } from '../store/choreStore';
import { useBillStore } from '../store/billStore';
import { useAnniversaryStore } from '../store/anniversaryStore';
import TabBar from '../components/TabBar';
import Header from '../components/Header';
import AnniversaryCard from '../components/AnniversaryCard';
import MealCard from '../components/MealCard';
import QuickActions from '../components/QuickActions';
import type { Anniversary } from '../api/anniversaryApi';

export default function Home() {
  const navigate = useNavigate();
  const { chores, loadChores } = useChoreStore();
  const { bills, loadBills } = useBillStore();
  const { anniversaries, loadAnniversaries, calculateDaysTogether } = useAnniversaryStore();

  useEffect(() => {
    loadChores();
    loadBills();
    loadAnniversaries();
  }, []);

  const pendingChores = chores.filter((c: any) => c.status === 'pending').length;
  const pendingBills = bills.filter((b: any) => b.status === 'pending').length;

  // 根据时间段显示问候
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了';
    if (hour < 9) return '🌅 早上好';
    if (hour < 12) return '☀️ 上午好';
    if (hour < 14) return '🌞 中午好';
    if (hour < 18) return '🌤️ 下午好';
    if (hour < 22) return '🌆 晚上好';
    return '🌙 夜深了';
  };

  const nickname = '宝贝';

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header title="我们的小家" showNotification />
      
      <div className="px-4 py-6 space-y-6">
        {/* 问候 */}
        <div className="text-white">
          <p className="text-lg mb-1">{getGreeting()}，{nickname} 💕</p>
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
        {anniversaries && anniversaries.length > 0 && (
          <AnniversaryCard 
            anniversary={anniversaries[0] as unknown as Anniversary}
            daysTogether={calculateDaysTogether(anniversaries[0].date)}
          />
        )}

        {/* 今天吃什么 - 新卡片 */}
        <div>
          <h2 className="text-white text-lg font-heading font-semibold mb-3">
            🍽️ 今天吃什么？
          </h2>
          <MealCard />
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

        {/* 快捷入口 */}
        <div>
          <h2 className="text-white text-lg font-heading font-semibold mb-3">
            🚀 常用功能
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: '🧊', label: '冰箱', path: '/fridge' },
              { icon: '💌', label: '留言', path: '/messages' },
              { icon: '📊', label: '统计', path: '/stats' },
              { icon: '🏆', label: '积分', path: '/points' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center text-white hover:bg-white/30 transition-all"
              >
                <span className="text-2xl block mb-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 统计 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <h3 className="text-white font-heading font-semibold mb-3">📊 我的数据</h3>
          <div className="grid grid-cols-3 gap-3 text-center text-white text-sm">
            <div>
              <p className="text-2xl font-bold">{chores.filter((c: any) => c.status === 'completed').length}</p>
              <p className="opacity-80">完成家务</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{bills.filter((b: any) => b.status === 'confirmed').length}</p>
              <p className="opacity-80">确认账单</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{anniversaries?.length || 0}</p>
              <p className="opacity-80">纪念日</p>
            </div>
          </div>
        </div>
      </div>

      <TabBar activeTab="home" />
    </div>
  );
}
