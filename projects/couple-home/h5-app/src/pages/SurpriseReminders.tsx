import { useEffect, useState } from 'react';
import { useReminderStore } from '../store/reminderStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { Reminder } from '../api/reminderApi';

export default function SurpriseReminders() {
  const {
    reminders,
    upcomingReminders,
    loadReminders,
    loadUpcoming,
    deleteReminder,
    markReminderCompleted,
    getGiftIdeas,
    getDateIdeas,
  } = useReminderStore();

  const [selectedType, setSelectedType] = useState<'all' | 'birthday' | 'anniversary' | 'holiday' | 'custom'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showGiftIdeas, setShowGiftIdeas] = useState<string | null>(null);
  const [showDateIdeas, setShowDateIdeas] = useState<string | null>(null);
  const [giftIdeas, setGiftIdeas] = useState<any>(null);
  const [dateIdeas, setDateIdeas] = useState<any>(null);

  useEffect(() => {
    loadReminders();
    loadUpcoming();
  }, []);

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个提醒吗？')) {
      try {
        await deleteReminder(id);
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await markReminderCompleted(id);
    } catch (error) {
      console.error('标记完成失败:', error);
    }
  };

  const handleAddNew = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const handleModalSave = () => {
    loadReminders();
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const handleViewGiftIdeas = async (reminder: Reminder) => {
    if (showGiftIdeas === reminder.id) {
      setShowGiftIdeas(null);
      return;
    }
    try {
      const ideas = await getGiftIdeas(reminder.type);
      setGiftIdeas(ideas);
      setShowGiftIdeas(reminder.id);
      setShowDateIdeas(null);
    } catch (error) {
      console.error('获取礼物推荐失败:', error);
    }
  };

  const handleViewDateIdeas = async (reminder: Reminder) => {
    if (showDateIdeas === reminder.id) {
      setShowDateIdeas(null);
      return;
    }
    try {
      const ideas = await getDateIdeas(reminder.type);
      setDateIdeas(ideas);
      setShowDateIdeas(reminder.id);
      setShowGiftIdeas(null);
    } catch (error) {
      console.error('获取约会建议失败:', error);
    }
  };

  const filteredReminders = selectedType === 'all'
    ? reminders
    : reminders.filter(r => r.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday': return '🎂';
      case 'anniversary': return '💕';
      case 'holiday': return '🎄';
      case 'custom': return '📌';
      default: return '🔔';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'birthday': return '生日';
      case 'anniversary': return '纪念日';
      case 'holiday': return '节日';
      case 'custom': return '自定义';
      default: return '提醒';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (reminder: Reminder) => {
    const daysUntil = getDaysUntil(reminder.date);
    if (daysUntil < 0) {
      return <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">已过</span>;
    } else if (daysUntil === 0) {
      return <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">今天!</span>;
    } else if (daysUntil <= 3) {
      return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{daysUntil}天后</span>;
    } else if (daysUntil <= 7) {
      return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">{daysUntil}天后</span>;
    } else {
      return <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{daysUntil}天后</span>;
    }
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-purple-100 to-pink-100">
      <Header 
        title="🎁 惊喜提醒" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 即将到期的提醒 */}
        {upcomingReminders.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg text-white">
            <h3 className="text-lg font-heading font-semibold mb-3">⏰ 即将到来的提醒</h3>
            <div className="space-y-2">
              {upcomingReminders.slice(0, 3).map(reminder => (
                <div key={reminder.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(reminder.type)}</span>
                      <span className="font-semibold">{reminder.title}</span>
                    </div>
                    <span className="text-sm bg-white/30 px-2 py-1 rounded-full">
                      {getDaysUntil(reminder.date)}天后
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 类型筛选 */}
        <div className="bg-white rounded-xl p-2 shadow-md flex gap-2 overflow-x-auto">
          {(['all', 'birthday', 'anniversary', 'holiday', 'custom'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? '全部' : getTypeName(type)}
            </button>
          ))}
        </div>

        {/* 提醒列表标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-heading font-semibold">
            📋 提醒列表
          </h2>
          <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
            {filteredReminders.length} 个
          </span>
        </div>

        {/* 提醒卡片列表 */}
        {filteredReminders.length > 0 ? (
          <div className="space-y-4">
            {filteredReminders.map(reminder => (
              <div key={reminder.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* 卡片头部 */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                      <div>
                        <h3 className="font-heading font-semibold text-gray-800">{reminder.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(reminder.date).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(reminder)}
                  </div>
                  
                  {reminder.notes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                      📝 {reminder.notes}
                    </p>
                  )}
                </div>

                {/* 卡片内容 */}
                <div className="p-4 space-y-3">
                  {/* 提醒天数 */}
                  {reminder.reminderDays && reminder.reminderDays.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⏰</span>
                      <span>提前 {reminder.reminderDays.join('天、')}天 提醒</span>
                    </div>
                  )}

                  {/* 礼物推荐按钮 */}
                  {reminder.giftIdeas && reminder.giftIdeas.length > 0 && (
                    <button
                      onClick={() => handleViewGiftIdeas(reminder)}
                      className="w-full text-left text-sm text-purple-600 hover:text-purple-700 flex items-center justify-between"
                    >
                      <span>💡 查看礼物推荐</span>
                      <span>{showGiftIdeas === reminder.id ? '▲' : '▼'}</span>
                    </button>
                  )}

                  {/* 约会建议按钮 */}
                  {reminder.dateIdeas && reminder.dateIdeas.length > 0 && (
                    <button
                      onClick={() => handleViewDateIdeas(reminder)}
                      className="w-full text-left text-sm text-pink-600 hover:text-pink-700 flex items-center justify-between"
                    >
                      <span>💕 查看约会建议</span>
                      <span>{showDateIdeas === reminder.id ? '▲' : '▼'}</span>
                    </button>
                  )}
                </div>

                {/* 展开的礼物推荐 */}
                {showGiftIdeas === reminder.id && giftIdeas && (
                  <div className="px-4 pb-4">
                    <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-semibold text-purple-800">{giftIdeas.category}</h4>
                      <div className="space-y-2">
                        {giftIdeas.ideas.map((idea: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-purple-700">
                            <span>•</span>
                            <span>{idea}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-purple-600">
                        <p>💰 预算：{giftIdeas.budget}</p>
                        <p>💭 {giftIdeas.reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 展开的约会建议 */}
                {showDateIdeas === reminder.id && dateIdeas && (
                  <div className="px-4 pb-4">
                    <div className="bg-pink-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-semibold text-pink-800">{dateIdeas.category}</h4>
                      <div className="space-y-2">
                        {dateIdeas.ideas.map((idea: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-pink-700">
                            <span>•</span>
                            <span>{idea}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-pink-600">
                        <p>💰 预算：{dateIdeas.budget}</p>
                        <p>⏱️ 时长：{dateIdeas.duration}</p>
                        <p>📋 准备：{dateIdeas.preparation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 卡片操作按钮 */}
                <div className="px-4 pb-4 flex gap-2">
                  {reminder.status === 'active' && (
                    <button
                      onClick={() => handleComplete(reminder.id)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
                    >
                      ✅ 标记完成
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <p className="text-5xl mb-3">🎁</p>
            <p className="text-lg font-heading">还没有提醒</p>
            <p className="text-sm opacity-80 mt-2">添加第一个提醒，不再错过重要日子~</p>
          </div>
        )}

        {/* 添加按钮 */}
        <button
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform animate-float"
          onClick={handleAddNew}
        >
          ➕
        </button>
      </div>

      {/* 创建/编辑提醒弹窗 */}
      {isModalOpen && (
        <ReminderModal
          reminder={editingReminder}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      <TabBar activeTab="surprise" />
    </div>
  );
}

// 提醒弹窗组件
interface ReminderModalProps {
  reminder: Reminder | null;
  onClose: () => void;
  onSave: () => void;
}

function ReminderModal({ reminder, onClose, onSave }: ReminderModalProps) {
  const { addReminder, updateReminder } = useReminderStore();
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    date: reminder?.date ? reminder.date.split('T')[0] : '',
    type: reminder?.type || 'birthday' as 'birthday' | 'anniversary' | 'holiday' | 'custom',
    notes: reminder?.notes || '',
    reminderDays: reminder?.reminderDays || [7, 3, 1],
    partnerName: reminder?.partnerName || '',
    isRecurring: reminder?.isRecurring ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (reminder) {
        await updateReminder(reminder.id, data);
      } else {
        await addReminder(data);
      }
      onSave();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(day)
        ? prev.reminderDays.filter(d => d !== day)
        : [...prev.reminderDays, day].sort((a, b) => a - b),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">
            {reminder ? '✏️ 编辑提醒' : '➕ 新建提醒'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              提醒标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：TA 的生日"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              提醒类型 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'birthday', label: '🎂 生日', icon: '🎂' },
                { value: 'anniversary', label: '💕 纪念日', icon: '💕' },
                { value: 'holiday', label: '🎄 节日', icon: '🎄' },
                { value: 'custom', label: '📌 自定义', icon: '📌' },
              ] as const).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.type === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              日期 *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* 伴侣姓名 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              伴侣姓名
            </label>
            <input
              type="text"
              value={formData.partnerName}
              onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
              placeholder="例如：小明"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 提醒天数 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⏰ 提前提醒
            </label>
            <div className="flex gap-2">
              {[1, 3, 7, 14, 30].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    formData.reminderDays.includes(day)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}天
                </button>
              ))}
            </div>
          </div>

          {/* 每年重复 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              🔄 每年重复提醒
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.isRecurring ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                formData.isRecurring ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="例如：喜欢粉色，想要..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '保存中...' : (reminder ? '💾 保存修改' : '✨ 创建提醒')}
          </button>
        </form>
      </div>
    </div>
  );
}
