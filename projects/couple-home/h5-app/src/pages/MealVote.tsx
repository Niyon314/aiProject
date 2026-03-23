import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealStore } from '../store/mealStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import MealOption from '../components/MealOption';
import MealVoteCard from '../components/MealVoteCard';

export default function MealVote() {
  const navigate = useNavigate();
  const { 
    todayVote, 
    loadTodayVote, 
    createTodayVote, 
    submitVote,
    isLoading, 
    error 
  } = useMealStore();
  
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTodayVote();
  }, []);

  const handleOptionVote = async (optionId: string, type: 'like' | 'dislike' | 'veto') => {
    if (isSubmitting) return;
    
    setSelectedOptionId(optionId);
    setIsSubmitting(true);
    
    try {
      await submitVote(optionId, type);
      // 投票成功后等待一下，让动画完成
      setTimeout(() => {
        setSelectedOptionId(null);
        setIsSubmitting(false);
      }, 500);
    } catch {
      setSelectedOptionId(null);
      setIsSubmitting(false);
    }
  };

  const handleCreateVote = async () => {
    await createTodayVote();
  };

  const handleGoToResult = () => {
    if (todayVote) {
      navigate(`/meal-result/${todayVote.id}`);
    }
  };

  // 加载中
  if (isLoading && !todayVote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">🍽️</div>
          <p className="text-gray-600 text-lg font-heading">加载中，马上就好~</p>
        </div>
      </div>
    );
  }

  // 没有投票，创建投票
  if (!todayVote) {
    return (
      <div className="min-h-screen pb-[80px] bg-gradient-to-br from-pink-50 to-purple-50">
        <Header 
          title="🍽️ 今天吃什么" 
          showNotification
          onBack={() => window.history.back()}
        />
        
        <div className="px-4 py-6">
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg border-2 border-pink-200">
            <div className="text-7xl mb-4">🤔</div>
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-3">
              还没有今天的投票
            </h2>
            <p className="text-gray-600 mb-6">
              快来创建今天的餐食投票吧~
            </p>
            <button
              onClick={handleCreateVote}
              disabled={isLoading}
              className="btn btn-primary py-4 px-8 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform"
            >
              ✨ 创建投票
            </button>
          </div>
        </div>

        <TabBar activeTab="eating" />
      </div>
    );
  }

  // 已经投票，显示结果入口
  if (todayVote.userVote) {
    return (
      <div className="min-h-screen pb-[80px] bg-gradient-to-br from-pink-50 to-purple-50">
        <Header 
          title="🍽️ 今天吃什么" 
          showNotification
          onBack={() => window.history.back()}
        />
        
        <div className="px-4 py-6 space-y-6">
          {/* 投票状态卡片 */}
          <MealVoteCard vote={todayVote} onClick={handleGoToResult} />
          
          {/* 提示信息 */}
          <div className="bg-white rounded-2xl p-6 text-center border-2 border-blue-200">
            <div className="text-5xl mb-3">💕</div>
            <p className="text-gray-800 font-semibold mb-2">
              你已经投票啦~
            </p>
            <p className="text-gray-600 text-sm">
              {todayVote.partnerVote 
                ? 'TA 也投票了，快去看看结果吧！' 
                : '等 TA 投票后就能看到结果哦~'}
            </p>
            
            <button
              onClick={handleGoToResult}
              className="mt-4 btn btn-primary py-3 px-6 font-bold"
            >
              {todayVote.partnerVote ? '🎉 查看结果' : '⏳ 等待 TA 投票'}
            </button>
          </div>

          {/* 选项列表（只读） */}
          <div>
            <h3 className="font-heading font-bold text-gray-800 mb-3 ml-1">
              📋 今天的选项
            </h3>
            <div className="space-y-4">
              {todayVote.options.map((option) => (
                <MealOption
                  key={option.id}
                  option={option}
                  userVote={todayVote.userVote?.optionId === option.id ? todayVote.userVote.type : undefined}
                  onVote={() => {}}
                  disabled={true}
                  showPartner={!!todayVote.partnerVote}
                  partnerVote={todayVote.partnerVote?.optionId === option.id ? todayVote.partnerVote.type : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        <TabBar activeTab="eating" />
      </div>
    );
  }

  // 投票中
  return (
    <div className="min-h-screen pb-[80px] bg-gradient-to-br from-pink-50 to-purple-50">
      <Header 
        title="🍽️ 今天吃什么" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 投票信息 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-gray-800">
                {todayVote.mealType === 'lunch' ? '🌞 午餐' : '🌙 晚餐'}投票
              </p>
              <p className="text-sm text-gray-500 mt-1">
                📅 {todayVote.date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">⏰ 截止时间</p>
              <p className="font-bold text-pink-600">
                {todayVote.mealType === 'lunch' ? '17:00' : '20:00'}
              </p>
            </div>
          </div>
        </div>

        {/* 选项列表 */}
        <div>
          <h3 className="font-heading font-bold text-gray-800 mb-3 ml-1">
            请选择你的喜好 ✨
          </h3>
          <div className="space-y-4">
            {todayVote.options.map((option) => (
              <MealOption
                key={option.id}
                option={option}
                userVote={todayVote.userVote?.optionId === option.id ? todayVote.userVote.type : undefined}
                onVote={(type) => handleOptionVote(option.id, type)}
                disabled={isSubmitting && selectedOptionId !== option.id}
              />
            ))}
          </div>
        </div>

        {/* 提交按钮（已投票时显示） */}
        {todayVote.userVote && (
          <button
            onClick={handleGoToResult}
            className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg"
          >
            ✨ 提交投票
          </button>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      <TabBar activeTab="eating" />
    </div>
  );
}
