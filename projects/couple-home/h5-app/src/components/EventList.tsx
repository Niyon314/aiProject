import type { CalendarEvent } from '../api/calendarApi';

interface EventListProps {
  events: CalendarEvent[];
  title: string;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  getConfirmationStatus: (event: CalendarEvent) => { icon: string; text: string; color: string };
  emptyMessage: string;
}

export default function EventList({
  events,
  title,
  onEdit,
  onDelete,
  getConfirmationStatus,
  emptyMessage,
}: EventListProps) {
  // getStatusStyle reserved for future use

  const getTypeText = (type: string) => {
    switch (type) {
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
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'date':
        return 'border-l-pink-500';
      case 'work':
        return 'border-l-blue-500';
      case 'family':
        return 'border-l-orange-500';
      case 'friend':
        return 'border-l-green-500';
      case 'other':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-md text-center">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-bold text-gray-800 text-lg px-2">
        {title} ({events.length})
      </h3>
      
      <div className="space-y-3">
        {events.map((event) => {
          const confirmationStatus = getConfirmationStatus(event);
          
          return (
            <div
              key={event.id}
              className={`rounded-2xl p-4 border-l-4 shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md bg-white ${getEventTypeColor(event.type)}`}
            >
              {/* 头部 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{event.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-gray-800 text-base">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {formatDate(event.startTime)} | 🕐 {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    event.status === 'planned'
                      ? 'bg-pink-100 text-pink-700'
                      : event.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {event.status === 'planned' && '📅 计划中'}
                  {event.status === 'completed' && '✅ 已完成'}
                  {event.status === 'cancelled' && '❌ 已取消'}
                </span>
              </div>

              {/* 描述信息 */}
              {event.description && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">💬 {event.description}</p>
                </div>
              )}

              {/* 详细信息 */}
              <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b border-gray-200/50">
                {event.location && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📍</span>
                    <span className="text-sm text-gray-600">{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏷️</span>
                  <span className="text-sm text-gray-600">{getTypeText(event.type)}</span>
                </div>
              </div>

              {/* 确认状态 */}
              <div className={`flex items-center gap-2 mb-3 text-sm ${confirmationStatus.color}`}>
                <span>{confirmationStatus.icon}</span>
                <span className="font-medium">{confirmationStatus.text}</span>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {onEdit && event.status === 'planned' && (
                  <button
                    onClick={() => onEdit(event)}
                    className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors"
                  >
                    ✏️ 编辑
                  </button>
                )}
                {onDelete && event.status === 'planned' && (
                  <button
                    onClick={() => onDelete(event.id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
                  >
                    🗑️ 删除
                  </button>
                )}
                {event.status === 'planned' && (
                  <>
                    <button
                      onClick={() => { /* TODO: 确认逻辑 */ }}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors"
                    >
                      ✅ 确认
                    </button>
                    <button
                      onClick={() => { /* TODO: 完成逻辑 */ }}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                    >
                      ✔️ 完成
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
