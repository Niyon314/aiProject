import { useEffect, useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import CalendarView from '../components/CalendarView';
import EventList from '../components/EventList';
import EventModal from '../components/EventModal';
import type { CalendarEvent } from '../api/calendarApi';

export default function Calendar() {
  const { events, loadEvents, loadUpcoming, deleteEvent } = useCalendarStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadEvents();
    loadUpcoming();
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const filteredEvents = selectedDate
    ? events.filter(e => e.startTime.startsWith(selectedDate))
    : events;

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个日程吗？')) {
      try {
        await deleteEvent(id);
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleModalSave = () => {
    // Store will handle the save
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const getConfirmationStatus = (event: CalendarEvent) => {
    switch (event.confirmedBy) {
      case 'both':
        return { icon: '✅', text: '双方已确认', color: 'text-green-600' };
      case 'user':
        return { icon: '👤', text: '我已确认', color: 'text-blue-600' };
      case 'partner':
        return { icon: '👥', text: 'TA 已确认', color: 'text-purple-600' };
      default:
        return { icon: '⏳', text: '待确认', color: 'text-gray-500' };
    }
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-pink-100 to-rose-100">
      <Header 
        title="📅 共享日历" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 视图切换 */}
        <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'month'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📆 月视图
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📅 周视图
          </button>
        </div>

        {/* 日历视图 */}
        <CalendarView 
          events={events}
          viewMode={viewMode}
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
          <EventList
            events={filteredEvents}
            title={selectedDate ? '当天日程' : '全部日程'}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getConfirmationStatus={getConfirmationStatus}
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
          onClick={handleAddEvent}
        >
          ➕
        </button>
      </div>

      {/* 创建/编辑日程弹窗 */}
      {isModalOpen && (
        <EventModal
          event={editingEvent}
          selectedDate={selectedDate}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      <TabBar activeTab="schedule" />
    </div>
  );
}
