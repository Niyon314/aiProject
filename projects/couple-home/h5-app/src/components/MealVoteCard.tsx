import type { MealVote } from '../api/mealApi';

interface MealVoteCardProps {
  vote: MealVote;
  onClick?: () => void;
}

export default function MealVoteCard({ vote, onClick }: MealVoteCardProps) {
  const getStatusStyle = () => {
    switch (vote.status) {
      case 'pending':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300';
      case 'voted':
        return 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300';
      case 'completed':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (vote.status) {
      case 'pending':
        return vote.userVote ? '已投票，等 TA 中...' : '待投票';
      case 'voted':
        return '双方已投票，结果即将揭晓';
      case 'completed':
        return vote.result ? `结果：${vote.result.icon} ${vote.result.name}` : '投票已结束';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (vote.status) {
      case 'pending':
        return vote.userVote ? '⏳' : '📝';
      case 'voted':
        return '💕';
      case 'completed':
        return '🎉';
      default:
        return '🍽️';
    }
  };

  const mealTypeText = vote.mealType === 'lunch' ? '午餐' : '晚餐';

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl p-5 border-2 shadow-sm transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-md ${getStatusStyle()}`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-heading font-bold text-gray-800">
              {mealTypeText}吃什么？
            </h3>
            <p className="text-xs text-gray-500">
              📅 {vote.date}
            </p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          vote.status === 'pending' ? 'bg-yellow-200 text-yellow-700' :
          vote.status === 'voted' ? 'bg-blue-200 text-blue-700' :
          'bg-green-200 text-green-700'
        }`}>
          {getStatusText()}
        </span>
      </div>

      {/* 选项数量 */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>🍴 {vote.options.length} 个选项</span>
        {vote.userVote && (
          <span className="text-pink-600 font-medium">
            ✓ 已投票
          </span>
        )}
      </div>

      {/* 选项预览 */}
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {vote.options.slice(0, 3).map((option) => (
          <div 
            key={option.id}
            className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 text-center"
          >
            <span className="text-2xl">{option.icon}</span>
            <p className="text-xs font-medium text-gray-700 mt-1">{option.name}</p>
          </div>
        ))}
        {vote.options.length > 3 && (
          <div className="flex-shrink-0 bg-pink-100 rounded-xl px-3 py-2 flex items-center justify-center">
            <span className="text-sm font-semibold text-pink-600">
              +{vote.options.length - 3}
            </span>
          </div>
        )}
      </div>

      {/* 截止时间 */}
      <div className="mt-3 pt-3 border-t border-gray-200/50">
        <p className="text-xs text-gray-500 text-center">
          ⏰ 投票截止：{vote.mealType === 'lunch' ? '17:00' : '20:00'}
        </p>
      </div>
    </div>
  );
}
