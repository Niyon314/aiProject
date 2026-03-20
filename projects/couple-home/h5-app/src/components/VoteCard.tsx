import { useAppStore } from '../store/appStore';
import type { Vote } from '../utils/db';

interface VoteCardProps {
  vote: Vote;
}

export default function VoteCard({ vote }: VoteCardProps) {
  const { voteOnMeal } = useAppStore();

  const totalVotes = vote.likes + vote.dislikes + vote.vetoes;
  const likePercentage = totalVotes > 0 ? Math.round((vote.likes / totalVotes) * 100) : 0;

  const handleVote = (type: 'like' | 'dislike' | 'veto') => {
    voteOnMeal(vote.id, type);
  };

  return (
    <div className="bg-white rounded-md p-3 shadow-sm border border-primary-light animate-fade-in">
      <div className="mb-2">
        <p className="text-lg font-heading font-semibold text-gray-800">
          {vote.mealIcon} {vote.mealName}
        </p>
        <p className="text-xs text-gray-500">
          💗 人气：{vote.likes} 票
        </p>
      </div>
      
      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>支持率</span>
          <span>{likePercentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-dark to-primary-dighter transition-all duration-300"
            style={{ width: `${likePercentage}%` }}
          />
        </div>
      </div>
      
      {/* 投票按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => handleVote('like')}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
            vote.userVote === 'like'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-primary/20'
          }`}
        >
          👍 喜欢
        </button>
        <button
          onClick={() => handleVote('dislike')}
          className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
            vote.userVote === 'dislike'
              ? 'bg-gray-400 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          👎 不喜欢
        </button>
      </div>
      
      {vote.vetoes < 3 && (
        <button
          onClick={() => handleVote('veto')}
          className={`w-full mt-2 py-2 rounded-full text-sm font-semibold transition-all ${
            vote.userVote === 'veto'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-red-100'
          }`}
        >
          🚫 否决 ({vote.vetoes}/3)
        </button>
      )}
    </div>
  );
}
