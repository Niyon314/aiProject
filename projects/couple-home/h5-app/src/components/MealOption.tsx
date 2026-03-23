import { useState } from 'react';
import type { MealOption as MealOptionType } from '../api/mealApi';

interface MealOptionProps {
  option: MealOptionType;
  userVote?: 'like' | 'dislike' | 'veto';
  onVote: (type: 'like' | 'dislike' | 'veto') => void;
  disabled?: boolean;
  showPartner?: boolean;
  partnerVote?: 'like' | 'dislike' | 'veto';
}

export default function MealOption({ 
  option, 
  userVote, 
  onVote, 
  disabled = false,
  showPartner = false,
  partnerVote,
}: MealOptionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVoteClick = (type: 'like' | 'dislike' | 'veto') => {
    if (disabled) return;
    setIsAnimating(true);
    onVote(type);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return 'text-green-600 bg-green-100';
      case '中等': return 'text-yellow-600 bg-yellow-100';
      case '困难': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVoteButtonStyle = (type: 'like' | 'dislike' | 'veto') => {
    const baseStyle = 'flex-1 py-2 rounded-full text-sm font-semibold transition-all transform';
    const activeStyle = 'scale-105 shadow-md';
    
    if (userVote === type) {
      switch (type) {
        case 'like': return `${baseStyle} ${activeStyle} bg-pink-500 text-white`;
        case 'dislike': return `${baseStyle} ${activeStyle} bg-gray-400 text-white`;
        case 'veto': return `${baseStyle} ${activeStyle} bg-red-500 text-white`;
      }
    }
    
    switch (type) {
      case 'like': return `${baseStyle} bg-pink-100 text-pink-600 hover:bg-pink-200 hover:scale-105`;
      case 'dislike': return `${baseStyle} bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105`;
      case 'veto': return `${baseStyle} bg-red-100 text-red-600 hover:bg-red-200 hover:scale-105`;
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all duration-300 ${
      userVote 
        ? 'border-pink-300 bg-pink-50/30' 
        : 'border-pink-100 hover:border-pink-300 hover:shadow-md'
    } ${isAnimating ? 'scale-[0.98]' : 'scale-100'}`}>
      {/* 头部：菜名和图标 */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{option.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-heading font-bold text-gray-800">{option.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getDifficultyColor(option.difficulty)}`}>
              {option.difficulty}
            </span>
            <span className="text-xs text-gray-500">
              ⏱️ {option.cookTime}分钟
            </span>
            <span className="text-xs text-gray-500">
              💰 ¥{option.cost}
            </span>
          </div>
        </div>
      </div>

      {/* 标签 */}
      {option.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {option.tags.map((tag, idx) => (
            <span 
              key={idx}
              className="text-xs px-2 py-1 bg-pink-100 text-pink-600 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 投票按钮 */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => handleVoteClick('like')}
          disabled={disabled}
          className={getVoteButtonStyle('like')}
        >
          👍 想吃
        </button>
        <button
          onClick={() => handleVoteClick('dislike')}
          disabled={disabled}
          className={getVoteButtonStyle('dislike')}
        >
          👎 不想
        </button>
      </div>
      
      <button
        onClick={() => handleVoteClick('veto')}
        disabled={disabled}
        className={getVoteButtonStyle('veto')}
      >
        ❌  veto
      </button>

      {/* 伴侣投票状态（仅投票后可见） */}
      {showPartner && partnerVote && (
        <div className="mt-3 pt-3 border-t border-pink-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">💕 TA 的选择：</span>
            <span className={`font-semibold px-3 py-1 rounded-full ${
              partnerVote === 'like' ? 'bg-pink-100 text-pink-600' :
              partnerVote === 'dislike' ? 'bg-gray-100 text-gray-600' :
              'bg-red-100 text-red-600'
            }`}>
              {partnerVote === 'like' ? '👍 想吃' :
               partnerVote === 'dislike' ? '👎 不想' :
               '❌  veto'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
