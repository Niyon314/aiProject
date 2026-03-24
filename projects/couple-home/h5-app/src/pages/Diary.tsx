import { useEffect, useState } from 'react';
import { useDiaryStore } from '../store/diaryStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { Diary, CreateDiaryRequest } from '../api/diaryApi';

export default function Diary() {
  const { diaries, loadDiaries, addDiary, deleteDiary, updatePrivacy } = useDiaryStore();
  const [viewMode, setViewMode] = useState<'timeline' | 'month'>('timeline');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  const [newContent, setNewContent] = useState('');
  const [newPrivacy, setNewPrivacy] = useState<'private' | 'shared'>('private');

  useEffect(() => {
    loadDiaries({ month: viewMode === 'month' ? selectedMonth : undefined });
  }, [viewMode, selectedMonth]);

  const handleAddDiary = () => {
    setEditingDiary(null);
    setNewContent('');
    setNewPrivacy('private');
    setIsModalOpen(true);
  };

  const handleEdit = (diary: Diary) => {
    setEditingDiary(diary);
    setNewContent(diary.content);
    setNewPrivacy(diary.privacy);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这篇日记吗？')) {
      try {
        await deleteDiary(id);
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDiary(null);
    setNewContent('');
  };

  const handleModalSave = async () => {
    if (!newContent.trim()) {
      alert('请输入日记内容');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const data: CreateDiaryRequest = {
        content: newContent,
        privacy: newPrivacy,
        date: editingDiary?.date || today,
      };

      if (editingDiary) {
        await useDiaryStore.getState().updateDiary(editingDiary.id, {
          content: newContent,
          privacy: newPrivacy,
        });
      } else {
        await addDiary(data);
      }
      setIsModalOpen(false);
      setEditingDiary(null);
      setNewContent('');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handlePrivacyToggle = async (diary: Diary) => {
    try {
      const newPrivacy = diary.privacy === 'private' ? 'shared' : 'private';
      await updatePrivacy(diary.id, newPrivacy);
    } catch (error) {
      console.error('更新隐私设置失败:', error);
      alert('更新失败，请重试');
    }
  };

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getDiariesByDate = (date: string) => {
    return diaries.filter((d) => d.date === date);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const renderTimelineView = () => {
    const groupedDiaries: { [key: string]: Diary[] } = {};
    diaries.forEach((diary) => {
      if (!groupedDiaries[diary.date]) {
        groupedDiaries[diary.date] = [];
      }
      groupedDiaries[diary.date].push(diary);
    });

    const sortedDates = Object.keys(groupedDiaries).sort((a, b) => b.localeCompare(a));

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-3">
            <h3 className="text-pink-500 font-semibold px-2">{formatDate(date)}</h3>
            {groupedDiaries[date].map((diary) => (
              <div
                key={diary.id}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      diary.privacy === 'private' 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-pink-100 text-pink-600'
                    }`}>
                      {diary.privacy === 'private' ? '🔒 私密' : '💕 共享'}
                    </span>
                    {diary.photos && diary.photos.length > 0 && (
                      <span className="text-sm text-gray-500">
                        📷 {diary.photos.length}张照片
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrivacyToggle(diary)}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      title="切换隐私设置"
                    >
                      {diary.privacy === 'private' ? '🔓' : '🔒'}
                    </button>
                    <button
                      onClick={() => handleEdit(diary)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {diary.content}
                </p>
                {diary.photos && diary.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {diary.photos.slice(0, 9).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`日记照片 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                    {diary.photos.length > 9 && (
                      <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        +{diary.photos.length - 9}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">📖</p>
            <p>还没有日记，快来记录你们的故事吧~</p>
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = new Date(selectedMonth + '-01').getDay();
    const adjustedFirstDay = firstDay === 0 ? 7 : firstDay; // Make Monday the first day

    const days = [];
    for (let i = 0; i < adjustedFirstDay - 1; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
      const dayDiaries = getDiariesByDate(dateStr);
      const hasDiaries = dayDiaries.length > 0;
      const hasSharedDiaries = dayDiaries.some((d) => d.privacy === 'shared');

      days.push(
        <div
          key={day}
          className={`h-20 border rounded-lg p-1 transition-all ${
            hasDiaries
              ? hasSharedDiaries
                ? 'bg-pink-50 border-pink-200'
                : 'bg-gray-50 border-gray-200'
              : 'border-gray-100'
          }`}
        >
          <div className="text-sm font-semibold text-gray-700">{day}</div>
          {hasDiaries && (
            <div className="mt-1 space-y-1">
              {dayDiaries.slice(0, 3).map((diary) => (
                <div
                  key={diary.id}
                  className={`text-xs px-1 py-0.5 rounded truncate ${
                    diary.privacy === 'shared'
                      ? 'bg-pink-200 text-pink-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {diary.privacy === 'shared' ? '💕' : '🔒'}
                  {diary.content.slice(0, 10)}...
                </div>
              ))}
              {dayDiaries.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{dayDiaries.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-4 shadow-md">
        {/* 月份选择 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const [year, month] = selectedMonth.split('-').map(Number);
              const prevMonth = month === 1 ? `${year - 1}-12` : `${year}-${(month - 1).toString().padStart(2, '0')}`;
              setSelectedMonth(prevMonth);
            }}
            className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ← 上月
          </button>
          <span className="text-lg font-semibold text-pink-500">
            {selectedMonth.replace('-', '年')}月
          </span>
          <button
            onClick={() => {
              const [year, month] = selectedMonth.split('-').map(Number);
              const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${(month + 1).toString().padStart(2, '0')}`;
              setSelectedMonth(nextMonth);
            }}
            className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            下月 →
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-200 rounded"></div>
            <span>共享日记</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>私密日记</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-pink-100 to-rose-100">
      <Header
        title="💕 恋爱日记"
        showNotification
        onBack={() => window.history.back()}
      />

      <div className="px-4 py-6 space-y-6">
        {/* 视图切换 */}
        <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📜 时间线
          </button>
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
        </div>

        {/* 日记内容 */}
        {viewMode === 'timeline' ? renderTimelineView() : renderMonthView()}

        {/* 添加按钮 */}
        <button
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform animate-float"
          onClick={handleAddDiary}
        >
          ➕
        </button>
      </div>

      {/* 创建/编辑日记弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-pink-500 mb-4">
              {editingDiary ? '✏️ 编辑日记' : '📝 写日记'}
            </h2>

            <div className="space-y-4">
              {/* 日记内容 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  今天发生了什么？
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="记录你们的美好时光..."
                  className="w-full h-40 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              {/* 隐私设置 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  隐私设置
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewPrivacy('private')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      newPrivacy === 'private'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    🔒 私密
                  </button>
                  <button
                    onClick={() => setNewPrivacy('shared')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      newPrivacy === 'shared'
                        ? 'bg-pink-200 text-pink-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    💕 共享
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {newPrivacy === 'private'
                    ? '只有你能看到这篇日记'
                    : '对方也能看到这篇日记哦~'}
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleModalClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleModalSave}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TabBar activeTab="diary" />
    </div>
  );
}
