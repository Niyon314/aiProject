import { useState } from 'react';
import type { Schedule } from '../api/scheduleApi';

interface CalendarProps {
  schedules: Schedule[];
  onDateSelect?: (date: string) => void;
}

export default function Calendar({ schedules, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const calendarDays = generateCalendarDays();

  // 获取某天的日程
  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => {
      const scheduleDate = schedule.startTime.split('T')[0];
      return scheduleDate === dateStr;
    });
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 导航到上个月
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 导航到下个月
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 导航到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
        >
          <span className="text-2xl">◀</span>
        </button>
        
        <div className="text-center">
          <h3 className="font-heading font-bold text-gray-800 text-lg">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-pink-500 hover:text-pink-600 mt-1"
          >
            回到今天
          </button>
        </div>

        <button
          onClick={goToNextMonth}
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
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, index) => {
          const daySchedules = getSchedulesForDate(item.date);
          const hasSchedule = daySchedules.length > 0;
          const isDateToday = isToday(item.date);

          return (
            <div
              key={index}
              onClick={() => onDateSelect?.(item.date.toISOString().split('T')[0])}
              className={`
                aspect-square p-1 rounded-lg cursor-pointer transition-all
                ${!item.isCurrentMonth ? 'text-gray-300' : ''}
                ${isDateToday ? 'bg-pink-500 text-white' : 'hover:bg-pink-100'}
                ${hasSchedule && !isDateToday ? 'bg-pink-100' : ''}
              `}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <span className={`text-sm ${isDateToday ? 'font-bold' : ''}`}>
                  {item.day}
                </span>
                {hasSchedule && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {daySchedules.slice(0, 3).map((schedule, i) => (
                      <span key={i} className="text-xs">
                        {schedule.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
