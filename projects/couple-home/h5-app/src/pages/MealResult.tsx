import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMealStore } from '../store/mealStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import MealResultDisplay from '../components/MealResultDisplay';

export default function MealResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    voteResult, 
    loadTodayVote, 
    getVoteResult,
    isLoading, 
    error 
  } = useMealStore();
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        await loadTodayVote();
        await getVoteResult();
        setIsLoaded(true);
      }
    };
    loadData();
  }, [id]);

  const handleRevote = () => {
    // 重新投票逻辑 - 可以跳转到创建新投票
    navigate('/meal-vote');
  };

  const handleOrder = () => {
    // 点外卖逻辑 - 可以跳转到外卖平台或显示推荐餐厅
    alert('即将跳转到外卖平台~ 🛒');
  };

  const handleCook = () => {
    // 自己做逻辑 - 可以跳转到菜谱详情
    alert('开始准备食材吧~ 👨‍🍳');
  };

  // 加载中
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">🎉</div>
          <p className="text-gray-600 text-lg font-heading">揭晓结果中...</p>
        </div>
      </div>
    );
  }

  // 没有结果
  if (!voteResult) {
    return (
      <div className="min-h-screen pb-[80px] bg-gradient-to-br from-pink-50 to-purple-50">
        <Header 
          title="🎉 投票结果" 
          showNotification
          onBack={() => window.history.back()}
        />
        
        <div className="px-4 py-6">
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg border-2 border-pink-200">
            <div className="text-7xl mb-4">😅</div>
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-3">
              结果还没出来
            </h2>
            <p className="text-gray-600 mb-6">
              等双方都投票后才能揭晓哦~
            </p>
            <button
              onClick={() => navigate('/meal-vote')}
              className="btn btn-primary py-3 px-6 font-bold"
            >
              返回投票
            </button>
          </div>
        </div>

        <TabBar activeTab="eating" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header 
        title="🎉 投票结果" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6">
        {/* 结果展示 */}
        <MealResultDisplay
          result={voteResult}
          onRevote={handleRevote}
          onOrder={handleOrder}
          onCook={handleCook}
        />

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 小贴士 */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>小贴士：</strong>如果结果不满意，可以重新投票或者从推荐中选择哦~
          </p>
        </div>
      </div>

      <TabBar activeTab="eating" />
    </div>
  );
}
