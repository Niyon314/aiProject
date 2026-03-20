import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

export default function Schedule() {
  const { loadChores, loadBills, chores, bills } = useAppStore();

  useEffect(() => {
    loadChores();
    loadBills();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayChores = chores.filter(c => c.dueDate === today && c.status === 'pending');
  const todayBills = bills.filter(b => b.date === today && b.status === 'pending');

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="日程" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 今日概览 */}
        <div className="bg-white rounded-md p-4 shadow-md">
          <h3 className="font-heading font-semibold text-gray-800 mb-2">
            📅 今日安排
          </h3>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('zh-CN', { 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          
          <div className="mt-4 flex gap-4">
            <div className="flex-1 bg-macaron-blue/20 rounded-md p-3 text-center">
              <p className="text-2xl mb-1">🧹</p>
              <p className="text-lg font-bold text-gray-700">{todayChores.length}</p>
              <p className="text-xs text-gray-500">待完成家务</p>
            </div>
            <div className="flex-1 bg-macaron-yellow/20 rounded-md p-3 text-center">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-lg font-bold text-gray-700">{todayBills.length}</p>
              <p className="text-xs text-gray-500">待确认账单</p>
            </div>
          </div>
        </div>

        {/* 今日家务 */}
        {todayChores.length > 0 && (
          <div>
            <h2 className="text-white text-lg font-heading font-semibold mb-3">
              🧹 今日家务
            </h2>
            <div className="space-y-2">
              {todayChores.map(chore => (
                <div key={chore.id} className="bg-white rounded-md p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{chore.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{chore.name}</p>
                      <p className="text-xs text-gray-500">⭐ {chore.points} 积分</p>
                    </div>
                    <span className="text-xs bg-macaron-blue text-gray-700 px-2 py-1 rounded-full">
                      待完成
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 今日账单 */}
        {todayBills.length > 0 && (
          <div>
            <h2 className="text-white text-lg font-heading font-semibold mb-3">
              💰 今日账单
            </h2>
            <div className="space-y-2">
              {todayBills.map(bill => (
                <div key={bill.id} className="bg-white rounded-md p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">🧾 {bill.title}</p>
                      <p className="text-xs text-gray-500">{bill.category}</p>
                    </div>
                    <span className="text-primary-dark font-bold">
                      ¥{bill.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {todayChores.length === 0 && todayBills.length === 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-md p-8 text-center text-white">
            <p className="text-5xl mb-3">🌸</p>
            <p className="text-lg font-heading">今天没有待办事项</p>
            <p className="text-sm opacity-80">好好享受二人世界吧~</p>
          </div>
        )}
      </div>

      <TabBar activeTab="schedule" />
    </div>
  );
}
