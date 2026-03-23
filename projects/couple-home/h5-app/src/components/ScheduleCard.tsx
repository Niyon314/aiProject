import type { Schedule } from '../api/scheduleApi';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (id: string) => void;
}

export default function ScheduleCard({ schedule, onEdit, onDelete }: ScheduleCardProps) {
  const getStatusStyle = () => {
    switch (schedule.status) {
      case 'planned':
        return 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-300';
      case 'completed':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300';
      case 'cancelled':
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusBadge = () => {
    switch (schedule.status) {
      case 'planned':
        return {
          bg: 'bg-pink-200',
          text: 'text-pink-700',
          label: '计划中',
          icon: '📅',
        };
      case 'completed':
        return {
          bg: 'bg-green-200',
          text: 'text-green-700',
          label: '已完成',
          icon: '✅',
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-200',
          text: 'text-gray-700',
          label: '已取消',
          icon: '❌',
        };
      default:
        return {
          bg: 'bg-gray-200',
          text: 'text-gray-700',
          label: schedule.status,
          icon: '📋',
        };
    }
  };

  const getTypeText = () => {
    switch (schedule.type) {
      case 'date':
        return '约会';
      case 'work':
        return '工作';
      case 'family':
        return '家庭';
      case 'friend':
        return '朋友';
      case 'other':
        return '其他';
      default:
        return '';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getReminderText = () => {
    switch (schedule.reminder) {
      case '1h':
        return '提前 1 小时';
      case '1d':
        return '提前 1 天';
      case '1w':
        return '提前 1 周';
      case 'none':
        return '无提醒';
      default:
        return '';
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      className={`rounded-2xl p-4 border-2 shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${getStatusStyle()}`}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{schedule.icon}</span>
          <div>
            <h3 className="font-heading font-bold text-gray-800 text-lg">
              {schedule.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              📅 {formatDate(schedule.startTime)} | 🕐 {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${statusBadge.bg} ${statusBadge.text}`}
        >
          {statusBadge.icon} {statusBadge.label}
        </span>
      </div>

      {/* 描述信息 */}
      {schedule.description && (
        <div className="mb-3 p-2 bg-white/60 rounded-lg">
          <p className="text-sm text-gray-600">💬 {schedule.description}</p>
        </div>
      )}

      {/* 详细信息 */}
      <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b border-gray-200/50">
        {schedule.location && (
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <span className="text-sm text-gray-600">{schedule.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm">🏷️</span>
          <span className="text-sm text-gray-600">{getTypeText()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">⏰</span>
          <span className="text-sm text-gray-600">{getReminderText()}</span>
        </div>
      </div>

      {/* 参与者 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">👥</span>
        <div className="flex gap-1">
          {schedule.participants.map((participant, index) => (
            <span
              key={index}
              className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full"
            >
              {participant === 'user' ? '我' : 'TA'}
            </span>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(schedule)}
            className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors"
          >
            ✏️ 编辑
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(schedule.id)}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            🗑️ 删除
          </button>
        )}
      </div>
    </div>
  );
}
