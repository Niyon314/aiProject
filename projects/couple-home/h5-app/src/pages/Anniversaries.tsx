import { useEffect } from 'react';
import { useAnniversaryStore } from '../store/anniversaryStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import AnniversaryCard from '../components/AnniversaryCard';
import DaysTogether from '../components/DaysTogether';

export default function Anniversaries() {
  const {
    anniversaries,
    daysTogether,
    loadAnniversaries,
    loadDaysTogether,
  } = useAnniversaryStore();

  useEffect(() => {
    loadAnniversaries();
    loadDaysTogether();
  }, []);

  const handleEdit = (anniversary: typeof anniversaries[0]) => {
    console.log('Edit anniversary:', anniversary);
    // TODO: 打开编辑表单
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个纪念日吗？')) {
      // TODO: 调用 store 的 deleteAnniversary
      console.log('Delete anniversary:', id);
    }
  };

  // 计算每个纪念日的天数
  const getDaysTogetherForAnniversary = (anniversary: typeof anniversaries[0]) => {
    if (anniversary.type !== 'relationship') return undefined;
    return daysTogether?.totalDays;
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-pink-100 to-rose-100">
      <Header 
        title="💕 纪念日" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 在一起天数 */}
        {daysTogether && (
          <DaysTogether daysData={daysTogether} showMilestone />
        )}

        {/* 纪念日列表标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-heading font-semibold">
            💝 我们的纪念日
          </h2>
          <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
            {anniversaries.length} 个
          </span>
        </div>

        {/* 纪念日卡片列表 */}
        {anniversaries.length > 0 ? (
          <div className="space-y-4">
            {anniversaries.map(anniversary => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                daysTogether={getDaysTogetherForAnniversary(anniversary)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <p className="text-5xl mb-3">💕</p>
            <p className="text-lg font-heading">还没有纪念日</p>
            <p className="text-sm opacity-80 mt-2">添加第一个纪念日，记录美好时光~</p>
          </div>
        )}

        {/* 添加按钮 */}
        <button
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform animate-float"
          onClick={() => {
            // TODO: 打开创建纪念日表单
            console.log('Add new anniversary');
          }}
        >
          ➕
        </button>
      </div>

      <TabBar activeTab="fridge" />
    </div>
  );
}
