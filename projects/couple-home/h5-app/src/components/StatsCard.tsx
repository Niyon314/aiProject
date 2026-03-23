import type { UserStats } from '../api/choreApi';

interface StatsCardProps {
  stats: UserStats;
  nickname: string;
  isUser?: boolean;
}

export default function StatsCard({ stats, nickname, isUser = false }: StatsCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border-2 shadow-sm transition-all ${
        isUser
          ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-300'
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{isUser ? '👸' : '🤴'}</span>
        <div>
          <h3 className="font-heading font-bold text-gray-800">{nickname}</h3>
          <p className="text-xs text-gray-500">本周表现</p>
        </div>
      </div>

      {/* 主要数据 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.totalPoints}</p>
          <p className="text-xs text-gray-500">总积分</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.completedTasks}</p>
          <p className="text-xs text-gray-500">完成任务</p>
        </div>
      </div>

      {/* 详细数据 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">⏰ 准时率</span>
          <span className="font-semibold text-gray-800">
            {(stats.onTimeRate * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">🔥 当前连续</span>
          <span className="font-semibold text-orange-500">{stats.currentStreak} 天</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">🏆 最长连续</span>
          <span className="font-semibold text-yellow-500">{stats.longestStreak} 天</span>
        </div>
      </div>
    </div>
  );
}
