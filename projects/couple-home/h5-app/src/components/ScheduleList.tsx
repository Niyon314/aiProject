import type { Schedule } from '../api/scheduleApi';
import ScheduleCard from './ScheduleCard';

interface ScheduleListProps {
  schedules: Schedule[];
  title?: string;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export default function ScheduleList({
  schedules,
  title,
  onEdit,
  onDelete,
  emptyMessage = '暂无日程安排',
}: ScheduleListProps) {
  // 按日期分组日程
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.startTime.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // 排序日期
  const sortedDates = Object.keys(groupedSchedules).sort();

  const formatDateGroup = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
  };

  if (schedules.length === 0) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
        <p className="text-5xl mb-3">📅</p>
        <p className="text-lg font-heading">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-white text-lg font-heading font-semibold">
          {title}
        </h2>
      )}

      {sortedDates.map(date => (
        <div key={date}>
          <h3 className="text-white font-semibold mb-3 text-sm opacity-90">
            {formatDateGroup(date)}
          </h3>
          <div className="space-y-3">
            {groupedSchedules[date].map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
