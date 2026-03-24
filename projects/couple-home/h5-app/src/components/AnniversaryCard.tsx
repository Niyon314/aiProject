import { useState, useEffect } from 'react';
import type { Anniversary } from '../api/anniversaryApi';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  daysTogether?: number;
  onEdit?: (anniversary: Anniversary) => void;
  onDelete?: (id: string) => void;
}

export default function AnniversaryCard({
  anniversary,
  daysTogether,
  onEdit,
  onDelete,
}: AnniversaryCardProps) {
  const [daysUntil, setDaysUntil] = useState(0);

  // 计算倒计时
  const calculateDaysUntil = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextAnniversary = new Date(anniversary.date);
    nextAnniversary.setFullYear(today.getFullYear());
    nextAnniversary.setHours(0, 0, 0, 0);

    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextAnniversary.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  useEffect(() => {
    setDaysUntil(calculateDaysUntil());
    
    // 每天更新一次
    const interval = setInterval(() => {
      setDaysUntil(calculateDaysUntil());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [anniversary.date]);

  const getTypeText = () => {
    switch (anniversary.type) {
      case 'festival':
        return '节日';
      case 'birthday':
        return '生日';
      case 'relationship':
        return '纪念日';
      case 'other':
        return '其他';
      default:
        return '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getYearLabel = () => {
    const currentYear = new Date().getFullYear();
    const anniversaryYear = anniversary.year;
    const yearsPassed = currentYear - anniversaryYear;
    
    if (anniversary.type === 'relationship') {
      return `第 ${yearsPassed + 1} 年`;
    }
    return `${yearsPassed > 0 ? `${yearsPassed}周年` : '今年'}`;
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border-2 border-pink-200 shadow-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-float">{anniversary.icon}</span>
          <div>
            <h3 className="font-heading font-bold text-gray-800 text-lg">
              {anniversary.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              📅 {formatDate(anniversary.date)} | 🏷️ {getTypeText()}
            </p>
          </div>
        </div>
      </div>

      {/* 倒计时展示 */}
      <div className="bg-white/60 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{getYearLabel()}</p>
            {daysTogether !== undefined && anniversary.type === 'relationship' && (
              <p className="text-xs text-pink-500 font-semibold">
                💕 已度过 {daysTogether} 天
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-pink-500 animate-pulse">
              {daysUntil}
            </p>
            <p className="text-xs text-gray-500">天后到来</p>
          </div>
        </div>

        {/* 进度条 */}
        {daysUntil > 0 && daysUntil <= 365 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>进度</span>
              <span>{Math.round(((365 - daysUntil) / 365) * 100)}%</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((365 - daysUntil) / 365) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 备注信息 */}
      {anniversary.notes && (
        <div className="mb-4 p-2 bg-white/60 rounded-lg">
          <p className="text-sm text-gray-600">💬 {anniversary.notes}</p>
        </div>
      )}

      {/* 提醒设置 */}
      {anniversary.reminderDays && anniversary.reminderDays.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">⏰</span>
          <span className="text-sm text-gray-600">
            提前 {anniversary.reminderDays.join('天、')}天 提醒
          </span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(anniversary)}
            className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors"
          >
            ✏️ 编辑
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(anniversary.id)}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            🗑️ 删除
          </button>
        )}
      </div>
    </div>
  );
}
