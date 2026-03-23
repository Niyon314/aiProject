import { useEffect, useState } from 'react';
import { useScheduleStore } from '../store/scheduleStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import Calendar from '../components/Calendar';
import ScheduleList from '../components/ScheduleList';
import type { Schedule } from '../api/scheduleApi';

export default function Schedule() {
  const { schedules, loadSchedules, loadUpcoming } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
    loadUpcoming();
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const filteredSchedules = selectedDate
    ? schedules.filter(s => s.startTime.startsWith(selectedDate))
    : schedules;

  const handleEdit = (schedule: Schedule) => {
    console.log('Edit schedule:', schedule);
    // TODO: 打开编辑表单
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个日程吗？')) {
      // TODO: 调用 store 的 deleteSchedule
      console.log('Delete schedule:', id);
    }
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-pink-100 to-rose-100">
      <Header 
        title="📅 日程管理" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 日历视图 */}
        <Calendar 
          schedules={schedules}
          onDateSelect={handleDateSelect}
        />

        {/* 选中日期提示 */}
        {selectedDate && (
          <div className="bg-white rounded-xl p-3 shadow-md flex items-center justify-between">
            <span className="text-pink-500 font-semibold">
              📌 {new Date(selectedDate).toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕ 清除筛选
            </button>
          </div>
        )}

        {/* 日程列表 */}
        <div>
          <ScheduleList
            schedules={filteredSchedules}
            title={selectedDate ? '当天日程' : '全部日程'}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage={
              selectedDate
                ? '这天还没有安排哦~'
                : '暂无日程安排'
            }
          />
        </div>

        {/* 添加按钮 */}
        <button
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform animate-float"
          onClick={() => {
            // TODO: 打开创建日程表单
            console.log('Add new schedule');
          }}
        >
          ➕
        </button>
      </div>

      <TabBar activeTab="fridge" />
    </div>
  );
}
