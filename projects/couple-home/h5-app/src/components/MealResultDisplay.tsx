import { useEffect, useState } from 'react';
import type { VoteResult } from '../api/mealApi';

interface MealResultDisplayProps {
  result: VoteResult;
  onRevote?: () => void;
  onOrder?: () => void;
  onCook?: () => void;
}

export default function MealResultDisplay({ 
  result, 
  onRevote, 
  onOrder, 
  onCook 
}: MealResultDisplayProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // 触发动画
    setShowAnimation(true);
    if (result.match) {
      // 匹配成功时显示彩带
      setTimeout(() => setShowConfetti(true), 200);
    }
  }, [result]);

  const getMatchedOptions = () => {
    return result.matchedOptions;
  };

  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    const colors = ['🌸', '💕', '✨', '🎉', '💖', '🌟'];
    const confetti = [];
    
    for (let i = 0; i < 30; i++) {
      confetti.push(
        <div
          key={i}
          className="confetti absolute text-2xl animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          {colors[Math.floor(Math.random() * colors.length)]}
        </div>
      );
    }
    
    return confetti;
  };

  const matchedOptions = getMatchedOptions();

  return (
    <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-pink-200 overflow-hidden">
      {/* 彩带动画 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {renderConfetti()}
        </div>
      )}

      {/* 结果头部 */}
      <div className={`text-center mb-6 transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        {result.match ? (
          <>
            <div className="text-6xl mb-3 animate-heart-beat">🎉</div>
            <h2 className="text-2xl font-heading font-bold text-pink-600 mb-2">
              完美匹配！
            </h2>
            <p className="text-gray-600">
              你们都选择了这个美味~
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-3">💝</div>
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              没有完美匹配
            </h2>
            <p className="text-gray-600">
              不过别担心，这些选项都不讨厌哦~
            </p>
          </>
        )}
      </div>

      {/* 匹配结果 */}
      {matchedOptions.length > 0 && (
        <div className={`mb-6 transition-all duration-500 delay-200 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border-2 border-pink-200">
            <p className="text-sm font-semibold text-pink-600 mb-3 text-center">
              💕 推荐选择
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {matchedOptions.map((option, idx) => (
                <div 
                  key={option.id}
                  className="bg-white rounded-xl p-3 shadow-sm text-center transform hover:scale-105 transition-transform"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <span className="text-4xl block mb-1">{option.icon}</span>
                  <p className="font-bold text-gray-800">{option.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ⏱️ {option.cookTime}min · ¥{option.cost}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 双方选择对比 */}
      <div className={`mb-6 transition-all duration-500 delay-300 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="font-heading font-semibold text-gray-800 mb-3 text-center">
          📊 你们的选择
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-sm text-gray-500 mb-2">👩 你</p>
              <p className="text-2xl">
                {result.vote.userVote?.type === 'like' ? '👍' :
                 result.vote.userVote?.type === 'dislike' ? '👎' : '❌'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {result.vote.userVote ? 
                  result.vote.options.find(o => o.id === result.vote.userVote?.optionId)?.name || '已投票' 
                  : '未投票'}
              </p>
            </div>
            <div className="text-3xl">💕</div>
            <div className="text-center flex-1">
              <p className="text-sm text-gray-500 mb-2">👨 TA</p>
              <p className="text-2xl">
                {result.vote.partnerVote?.type === 'like' ? '👍' :
                 result.vote.partnerVote?.type === 'dislike' ? '👎' : '❌'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {result.vote.partnerVote ? 
                  result.vote.options.find(o => o.id === result.vote.partnerVote?.optionId)?.name || '已投票' 
                  : '未投票'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 推荐餐厅/外卖 */}
      {result.recommendation && (
        <div className={`mb-6 transition-all duration-500 delay-400 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm font-semibold text-blue-600 mb-2">
              📍 推荐餐厅
            </p>
            <p className="text-gray-800 font-bold">{result.recommendation.name}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span>💰 ¥{result.recommendation.price}</span>
              {result.recommendation.deliveryTime && (
                <span>🚚 {result.recommendation.deliveryTime}分钟</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className={`flex flex-col gap-3 transition-all duration-500 delay-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={onOrder}
          className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform"
        >
          🛒 点外卖
        </button>
        
        <button
          onClick={onCook}
          className="w-full btn btn-secondary py-4 text-lg font-bold shadow-md transform hover:scale-105 transition-transform"
        >
          👨‍🍳 自己做
        </button>
        
        <button
          onClick={onRevote}
          className="w-full btn btn-ghost py-3 text-gray-500"
        >
          🔄 重新投票
        </button>
      </div>
    </div>
  );
}
