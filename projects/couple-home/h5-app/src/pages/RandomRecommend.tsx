import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFridgeStore } from '../store/fridgeStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

// 预设菜谱
const recipes = [
  { name: '西红柿炒蛋', icon: '🍳', ingredients: ['西红柿', '鸡蛋'], reason: '经典家常菜，简单又美味~' },
  { name: '红烧肉', icon: '🥩', ingredients: ['猪肉', '鸡蛋'], reason: '香浓入味，超级下饭！' },
  { name: '清炒时蔬', icon: '🥬', ingredients: ['青菜', '大蒜'], reason: '健康清爽，补充维生素~' },
  { name: '宫保鸡丁', icon: '🍗', ingredients: ['鸡肉', '花生'], reason: '酸辣开胃，百吃不厌！' },
  { name: '麻婆豆腐', icon: '🍲', ingredients: ['豆腐', '猪肉'], reason: '麻辣鲜香，米饭杀手~' },
  { name: '煎蛋配吐司', icon: '🍞', ingredients: ['鸡蛋', '面包'], reason: '快手早餐，营养满分！' },
  { name: '蔬菜沙拉', icon: '🥗', ingredients: ['生菜', '西红柿'], reason: '低卡健康，减肥必备~' },
  { name: '牛肉炒面', icon: '🍜', ingredients: ['牛肉', '面条'], reason: '香浓劲道，饱腹感强！' },
  { name: '蒸蛋羹', icon: '🥚', ingredients: ['鸡蛋'], reason: '嫩滑可口，老少皆宜~' },
  { name: '土豆炖牛肉', icon: '🥘', ingredients: ['牛肉', '土豆'], reason: '软烂入味，温暖治愈~' },
];

export default function RandomRecommend() {
  const navigate = useNavigate();
  const { items: fridgeItems, loadItems: loadFridgeItems } = useFridgeStore();
  const [currentRecommendation, setCurrentRecommendation] = useState<typeof recipes[0] | null>(null);
  const [matchedIngredients, setMatchedIngredients] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadFridgeItems();
  }, []);

  // 获取冰箱里的食材名称
  const getFridgeIngredientNames = () => {
    return fridgeItems
      .filter(item => item.status !== 'expired')
      .map(item => item.name);
  };

  // 随机推荐算法
  const generateRecommendation = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      const fridgeIngredients = getFridgeIngredientNames();
      const disliked: string[] = [];
      
      // 过滤掉不喜欢的菜谱
      const availableRecipes = recipes.filter(r => !disliked.includes(r.name));
      
      // 计算每个菜谱的匹配度
      const scoredRecipes = availableRecipes.map(recipe => {
        const matchCount = recipe.ingredients.filter(ing => 
          fridgeIngredients.some(fridgeIng => fridgeIng.includes(ing) || ing.includes(fridgeIng))
        ).length;
        return { ...recipe, score: matchCount };
      });
      
      // 按匹配度排序，但有随机性
      const sorted = scoredRecipes.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff > 0) return -1;
        if (scoreDiff < 0) return 1;
        return Math.random() - 0.5;
      });
      
      // 从前三名中随机选一个
      const topPicks = sorted.slice(0, Math.min(3, sorted.length));
      const selected = topPicks[Math.floor(Math.random() * topPicks.length)];
      
      // 找出匹配的食材
      const matched = fridgeIngredients.filter(ing => 
        selected.ingredients.some(recipeIng => ing.includes(recipeIng) || recipeIng.includes(ing))
      );
      
      setCurrentRecommendation(selected);
      setMatchedIngredients(matched.slice(0, 3));
      setIsAnimating(false);
    }, 300);
  };

  // 首次加载时生成推荐
  useEffect(() => {
    if (fridgeItems.length > 0 && !currentRecommendation) {
      generateRecommendation();
    }
  }, [fridgeItems]);

  // 换一批
  const handleRefresh = () => {
    generateRecommendation();
  };

  // 就吃这个 - 跳转到投票
  const handleSelect = () => {
    if (currentRecommendation) {
      // TODO: 创建投票或直接跳转到投票页面
      navigate('/add', { 
        state: { 
          mealName: currentRecommendation.name, 
          mealIcon: currentRecommendation.icon 
        } 
      });
    }
  };

  // 不想吃 - 记录偏好
  const handleDislike = async () => {
    if (currentRecommendation) {
// TODO: save preference to backend
// TODO: save preference to backend
// TODO: save preference to backend
// TODO: save preference to backend
// TODO: save preference to backend
// TODO: save preference to backend
      handleRefresh();
    }
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="🎲 今天吃什么" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 推荐卡片 */}
        <div className="bg-white rounded-md shadow-lg border-2 border-primary-light overflow-hidden">
          {/* 顶部装饰 */}
          <div className="bg-gradient-to-br from-primary-light to-primary h-24 flex items-center justify-center">
            <div className={`text-7xl ${isAnimating ? 'animate-heart-beat' : ''}`}>
              {currentRecommendation?.icon || '🍽️'}
            </div>
          </div>
          
          {/* 内容区 */}
          <div className="p-6 text-center">
            {currentRecommendation ? (
              <>
                <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
                  {currentRecommendation.name}
                </h2>
                
                {/* 匹配食材 */}
                {matchedIngredients.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">✅ 冰箱里有这些食材：</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {matchedIngredients.map((ing, idx) => (
                        <span 
                          key={idx}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 推荐理由 */}
                <div className="bg-primary-light/10 rounded-md p-4 mb-6">
                  <p className="text-gray-700 font-semibold">
                    💡 {currentRecommendation.reason}
                  </p>
                </div>
                
                {/* 操作按钮 */}
                <div className="space-y-3">
                  <button
                    onClick={handleSelect}
                    className="w-full btn btn-primary py-4 text-lg"
                  >
                    ✨ 就吃这个！
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleRefresh}
                      className="flex-1 btn btn-secondary py-3"
                    >
                      🔄 换一批
                    </button>
                    <button
                      onClick={handleDislike}
                      className="flex-1 btn btn-ghost py-3 text-gray-500"
                    >
                      😕 不想吃
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-5xl mb-4">🤔</p>
                <p className="text-gray-600">正在思考中...</p>
              </div>
            )}
          </div>
        </div>

        {/* 冰箱库存提示 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-md p-4">
          <h3 className="font-heading font-semibold text-gray-800 mb-3">
            🧊 冰箱库存
          </h3>
          
          {fridgeItems.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {fridgeItems
                  .filter(item => item.status !== 'expired')
                  .slice(0, 10)
                  .map((item, idx) => (
                    <span 
                      key={idx}
                      className="bg-white border border-primary-light px-3 py-1 rounded-full text-sm"
                    >
                      {item.name} × {item.quantity}{item.unit}
                    </span>
                  ))}
              </div>
              {fridgeItems.filter(item => item.status !== 'expired').length > 10 && (
                <p className="text-xs text-gray-400 text-center">
                  还有 {fridgeItems.filter(item => item.status !== 'expired').length - 10} 种食材...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">冰箱是空的，先去采购吧~ 🛒</p>
              <button
                onClick={() => navigate('/fridge')}
                className="mt-2 text-primary-dark font-semibold text-sm"
              >
                去管理冰箱 →
              </button>
            </div>
          )}
        </div>

        {/* 小贴士 */}
        <div className="bg-gradient-to-br from-primary-light/30 to-primary/30 rounded-md p-4">
          <p className="text-sm text-gray-700">
            💡 <strong>小贴士：</strong>点击"不想吃"可以记录你的口味偏好，
            系统会越来越懂你哦~
          </p>
        </div>
      </div>

      <TabBar activeTab="eating" />
    </div>
  );
}
