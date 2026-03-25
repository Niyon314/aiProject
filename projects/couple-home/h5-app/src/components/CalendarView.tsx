import { useState } from 'react';
import type { CalendarEvent } from '../api/calendarApi';

interface CalendarViewProps {
  events: CalendarEvent[];
  viewMode: 'month' | 'week';
  onDateSelect?: (date: string) => void;
}

export default function CalendarView({ events, viewMode, onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  // 获取当月第一天
  const firstDay = new Date(year, month, 1);
  // 获取当月最后一天
  const lastDay = new Date(year, month + 1, 0);
  // 获取第一天是星期几 (0-6, 0 是周日)
  const firstDayOfWeek = firstDay.getDay() || 7;

  // 生成日历网格
  const generateCalendarDays = () => {
    const days = [];
    
    // 添加上个月的填充天数
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      days.push({
        day: prevMonthLastDay - i + 1,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i + 1),
      });
    }

    // 添加当月天数
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }

    // 添加下个月的填充天数
    const remainingDays = 42 - days.length; // 6 行 x 7 天 = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  // 生成周视图数据
  const generateWeekDays = () => {
    const days = [];
    const currentDayOfWeek = currentDate.getDay() || 7; // 1-7
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(day - currentDayOfWeek + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        date: date,
      });
    }

    return days;
  };

  // 获取某天的日程
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = event.startTime.split('T')[0];
      return eventDate === dateStr;
    });
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 导航到上个月/周
  const goToPrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(day - 7);
      setCurrentDate(newDate);
    }
  };

  // 导航到下个月/周
  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(day + 7);
      setCurrentDate(newDate);
    }
  };

  // 导航到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'date':
        return 'bg-pink-400';
      case 'work':
        return 'bg-blue-400';
      case 'family':
        return 'bg-orange-400';
      case 'friend':
        return 'bg-green-400';
      case 'other':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // getConfirmationBadge reserved for future use

  const calendarDays = viewMode === 'month' ? generateCalendarDays() : generateWeekDays();
  const weekStart = viewMode === 'week' ? monthNames[month] + ' ' + year : monthNames[month] + ' ' + year;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      {/* 月份/周导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrev}
          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
        >
          <span className="text-2xl">◀</span>
        </button>
        
        <div className="text-center">
          <h3 className="font-heading font-bold text-gray-800 text-lg">
            {weekStart}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-pink-500 hover:text-pink-600 mt-1"
          >
            回到今天
          </button>
        </div>

        <button
          onClick={goToNext}
          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
        >
          <span className="text-2xl">▶</span>
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-1`}>
        {calendarDays.map((item, index) => {
          const dayEvents = getEventsForDate(item.date);
          const hasEvents = dayEvents.length > 0;
          const isDateToday = isToday(item.date);

          return (
            <div
              key={index}
              onClick={() => onDateSelect?.(item.date.toISOString().split('T')[0])}
              className={`
                min-h-[80px] p-1 rounded-lg cursor-pointer transition-all
                ${!item.isCurrentMonth ? 'text-gray-300' : ''}
                ${isDateToday ? 'bg-pink-500 text-white' : 'hover:bg-pink-100'}
                ${hasEvents && !isDateToday ? 'bg-pink-50' : ''}
              `}
            >
              <div className="h-full flex flex-col">
                <span className={`text-sm ${isDateToday ? 'font-bold' : ''} text-center`}>
                  {item.day}
                </span>
                {hasEvents && (
                  <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                    {dayEvents.slice(0, viewMode === 'month' ? 3 : 5).map((event, i) => (
                      <div
                        key={i}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)} ${
                          isDateToday ? 'text-white' : 'text-white'
                        }`}
                        title={event.title}
                      >
                        <span className="flex items-center gap-0.5">
                          {event.icon}
                          <span className="truncate">{event.title}</span>
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > (viewMode === 'month' ? 3 : 5) && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - (viewMode === 'month' ? 3 : 5)} 更多
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-pink-400"></span>
            <span>约会</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-400"></span>
            <span>工作</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-400"></span>
            <span>家庭</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-400"></span>
            <span>朋友</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-400"></span>
            <span>其他</span>
          </div>
        </div>
      </div>
    </div>
  );
}
