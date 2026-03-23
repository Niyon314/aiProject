import type { LeaderboardEntry } from '../api/choreApi';

interface LeaderboardDisplayProps {
  leaderboard: LeaderboardEntry[];
  userNickname: string;
  partnerNickname: string;
}

export default function LeaderboardDisplay({
  leaderboard,
  userNickname,
  partnerNickname,
}: LeaderboardDisplayProps) {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-3">
      {sortedLeaderboard.map((entry) => {
        const displayName =
          entry.name === 'user'
            ? userNickname
            : entry.name === 'partner'
            ? partnerNickname
            : entry.name;

        return (
          <div
            key={entry.userId}
            className={`rounded-2xl p-4 border-2 transition-all ${getRankStyle(
              entry.rank
            )}`}
          >
            <div className="flex items-center gap-4">
              {/* 排名 */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {entry.rank <= 3 ? (
                  <span className="text-4xl">{getMedalEmoji(entry.rank)}</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* 用户信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">
                    {entry.rank === 1 ? '👑' : entry.rank <= 3 ? '⭐' : '👤'}
                  </span>
                  <span className="font-heading font-bold text-gray-800">
                    {displayName}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>⭐ {entry.totalPoints} 分</span>
                  <span>✅ {entry.completedTasks} 任务</span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="flex-shrink-0 w-20">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((entry.totalPoints / 500) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
