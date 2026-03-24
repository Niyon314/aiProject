import { useState, useEffect } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import type { CalendarEvent, CreateEventRequest } from '../api/calendarApi';

interface EventModalProps {
  event: CalendarEvent | null;
  selectedDate: string | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EventModal({ event, selectedDate, onClose, onSave }: EventModalProps) {
  const { addEvent, updateEvent } = useCalendarStore();
  
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    type: 'date',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    icon: '📅',
    reminder: 'none',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || '',
        description: event.description || '',
        icon: event.icon,
        reminder: event.reminder,
      });
    } else if (selectedDate) {
      // 默认设置为选中日期的上午 10 点到 11 点
      const defaultStart = `${selectedDate}T10:00`;
      const defaultEnd = `${selectedDate}T11:00`;
      setFormData(prev => ({
        ...prev,
        startTime: defaultStart,
        endTime: defaultEnd,
      }));
    }
  }, [event, selectedDate]);

  const iconOptions = ['📅', '🎉', '💼', '🏠', '👨‍👩‍👧‍👦', '🍽️', '🎬', '✈️', '🏥', '🎂', '🎵', '📚'];
  const typeOptions = [
    { value: 'date', label: '约会', color: 'bg-pink-500' },
    { value: 'work', label: '工作', color: 'bg-blue-500' },
    { value: 'family', label: '家庭', color: 'bg-orange-500' },
    { value: 'friend', label: '朋友', color: 'bg-green-500' },
    { value: 'other', label: '其他', color: 'bg-gray-500' },
  ];
  const reminderOptions = [
    { value: 'none', label: '无提醒' },
    { value: '1h', label: '提前 1 小时' },
    { value: '1d', label: '提前 1 天' },
    { value: '1w', label: '提前 1 周' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入日程标题';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = '请选择结束时间';
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = '结束时间必须晚于开始时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      if (event) {
        await updateEvent(event.id, formData);
      } else {
        await addEvent(formData);
      }
      onSave();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
          <h2 className="font-heading font-bold text-xl text-gray-800">
            {event ? '✏️ 编辑日程' : '➕ 创建日程'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="text-2xl text-gray-500">✕</span>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="输入日程标题"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                errors.title ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              类型
            </label>
            <div className="grid grid-cols-5 gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('type', option.value)}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                    formData.type === option.value
                      ? `${option.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 图标选择 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              图标
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleChange('icon', icon)}
                  className={`py-2 text-2xl rounded-lg transition-all ${
                    formData.icon === icon
                      ? 'bg-pink-100 ring-2 ring-pink-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* 时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                开始时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className={`w-full px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm ${
                  errors.startTime ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                结束时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={`w-full px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm ${
                  errors.endTime ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              地点
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="输入地点（可选）"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="输入详细描述（可选）"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none"
            />
          </div>

          {/* 提醒 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              提醒
            </label>
            <select
              value={formData.reminder}
              onChange={(e) => handleChange('reminder', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-md"
            >
              {event ? '💾 保存修改' : '➕ 创建日程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
