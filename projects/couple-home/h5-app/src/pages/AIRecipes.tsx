import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import { recipeApi, type FridgeItem, type Recipe, type ShoppingListItem } from '../api/recipeApi';

type ViewMode = 'ingredients' | 'recipes' | 'shopping';

export default function AIRecipes() {
  const navigate = useNavigate();
  
  // 状态管理
  const [viewMode, setViewMode] = useState<ViewMode>('ingredients');
  const [loading, setLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [recommendationReason, setRecommendationReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 加载冰箱食材
  useEffect(() => {
    loadFridgeItems();
  }, []);

  const loadFridgeItems = async () => {
    try {
      setLoading(true);
      const items = await recipeApi.getFridgeItems();
      setFridgeItems(items);
      // 默认选中所有新鲜食材
      const freshItems = items.filter(item => item.status === 'fresh');
      setSelectedIngredients(new Set(freshItems.map(item => item.id)));
    } catch (err) {
      setError('加载食材失败，请重试');
      console.error('加载食材失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 切换食材选择
  const toggleIngredient = (id: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIngredients(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIngredients.size === fridgeItems.length) {
      setSelectedIngredients(new Set());
    } else {
      setSelectedIngredients(new Set(fridgeItems.map(item => item.id)));
    }
  };

  // AI 推荐菜谱
  const handleAIRecommend = async () => {
    if (selectedIngredients.size === 0) {
      setError('请至少选择一个食材');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await recipeApi.aiRecommend({
        fridgeItemIds: Array.from(selectedIngredients),
        maxResults: 10,
      });
      
      setRecommendedRecipes(response.recipes);
      setRecommendationReason(response.recommendationReason);
      setViewMode('recipes');
    } catch (err) {
      setError('AI 推荐失败，请重试');
      console.error('AI 推荐失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 生成购物清单
  const handleGenerateShoppingList = async (recipeIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipeApi.generateShoppingList({
        recipeIds,
      });
      
      setShoppingList(response.items);
      setViewMode('shopping');
    } catch (err) {
      setError('生成购物清单失败，请重试');
      console.error('生成购物清单失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 查看菜谱详情
  const viewRecipeDetail = (_recipeId: string) => {
    // TODO: 实现菜谱详情页
    alert('菜谱详情功能开发中...');
  };

  // 获取食材分类图标
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      vegetable: '🥬',
      meat: '🥩',
      egg: '🥚',
      staple: '🍚',
      other: '📦',
    };
    return icons[category] || '📦';
  };

  // 获取食材状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'expired':
        return 'opacity-50 bg-red-50 border-red-300';
      case 'warning':
        return 'bg-orange-50 border-orange-300';
      case 'fresh':
        return 'bg-white border-green-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // 渲染食材选择视图
  const renderIngredientsView = () => (
    <div className="space-y-4">
      {/* 食材卡片 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-gray-800">
            🧊 冰箱里有这些食材
          </h3>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-primary font-semibold hover:underline"
          >
            {selectedIngredients.size === fridgeItems.length ? '取消全选' : '全选'}
          </button>
        </div>

        {fridgeItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🧊</p>
            <p className="text-gray-500">冰箱是空的哦~</p>
            <button
              onClick={() => navigate('/fridge')}
              className="mt-3 btn btn-primary"
            >
              去添加食材
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
            {fridgeItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.status !== 'expired' && toggleIngredient(item.id)}
                disabled={item.status === 'expired'}
                className={`p-3 rounded-xl border-2 text-left transition-all ${getStatusStyle(item.status)} ${
                  selectedIngredients.has(item.id)
                    ? 'border-primary bg-primary/10'
                    : ''
                } ${item.status === 'expired' ? 'cursor-not-allowed' : 'active:scale-95'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getCategoryIcon(item.category)}</span>
                  <span className="text-sm font-semibold truncate">{item.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {item.quantity} {item.unit}
                </div>
                {item.status === 'warning' && (
                  <div className="text-xs text-orange-600 mt-1">⚠️ 临期</div>
                )}
                {item.status === 'expired' && (
                  <div className="text-xs text-red-600 mt-1">❌ 过期</div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={loadFridgeItems}
            className="flex-1 btn btn-ghost"
          >
            🔄 刷新
          </button>
          <button
            onClick={() => navigate('/fridge')}
            className="flex-1 btn btn-secondary"
          >
            ➕ 添加
          </button>
        </div>
      </div>

      {/* AI 推荐按钮 */}
      {fridgeItems.length > 0 && (
        <button
          onClick={handleAIRecommend}
          disabled={selectedIngredients.size === 0 || loading}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-heading font-semibold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🤖</span>
              AI 思考中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🤖 AI 推荐菜谱
            </span>
          )}
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );

  // 渲染菜谱推荐视图
  const renderRecipesView = () => (
    <div className="space-y-4">
      {/* AI 推荐理由 */}
      {recommendationReason && (
        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-2xl p-4 border border-primary/20">
          <p className="text-sm text-gray-700">
            💡 {recommendationReason}
          </p>
        </div>
      )}

      {/* 菜谱列表 */}
      {recommendedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">😅</p>
          <p className="text-gray-500">没有找到合适的菜谱</p>
          <button
            onClick={() => setViewMode('ingredients')}
            className="mt-4 btn btn-primary"
          >
            重新选择食材
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendedRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg text-gray-800">
                    {recipe.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {recipe.description}
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: recipeApi.getMatchScoreColor(recipe.matchScore),
                    color: 'white',
                  }}
                >
                  {recipeApi.getMatchScoreLabel(recipe.matchScore)}
                </div>
              </div>

              {/* 菜谱信息 */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>⏱️ {recipeApi.formatCookTime(recipe.cookTime)}</span>
                <span>💰 约 ¥{recipe.calories}</span>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: recipeApi.getDifficultyColor(recipe.difficulty),
                    color: 'white',
                  }}
                >
                  {recipeApi.getDifficultyLabel(recipe.difficulty)}
                </span>
              </div>

              {/* 匹配食材 */}
              <div className="text-xs text-gray-500 mb-3">
                ✅ 匹配食材：{recipe.ingredients.filter(i => i.hasInFridge).length}/{recipe.ingredients.length}
                {recipe.missingIngredients.length > 0 && (
                  <span className="text-orange-500 ml-2">
                    缺：{recipe.missingIngredients.slice(0, 3).join('、')}
                    {recipe.missingIngredients.length > 3 && '...'}
                  </span>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => viewRecipeDetail(recipe.id)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  📖 查看做法
                </button>
                <button
                  onClick={() => handleGenerateShoppingList([recipe.id])}
                  className="flex-1 btn btn-primary text-sm"
                >
                  🛒 加入购物单
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-[80px] left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white/90 to-transparent">
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('ingredients')}
            className="flex-1 btn btn-ghost"
          >
            ← 重新选择
          </button>
          {recommendedRecipes.length > 0 && (
            <button
              onClick={() => handleGenerateShoppingList(recommendedRecipes.map(r => r.id))}
              className="flex-1 btn btn-primary"
            >
              🛒 生成购物清单
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 渲染购物清单视图
  const renderShoppingView = () => {
    // 按分类分组
    const groupedItems = shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    const totalEstimatedPrice = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);

    return (
      <div className="space-y-4">
        {/* 总计 */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">共 {shoppingList.length} 项</p>
              <p className="text-lg font-heading font-semibold text-primary-dark">
                预计 ¥{totalEstimatedPrice.toFixed(2)}
              </p>
            </div>
            <button className="btn btn-primary">
              🛍️ 一键购买
            </button>
          </div>
        </div>

        {/* 分类列表 */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-heading font-semibold text-gray-800 mb-3">
              {category === 'vegetable' && '🥬 '}
              {category === 'meat' && '🥩 '}
              {category === 'staple' && '🍚 '}
              {category === 'other' && '📦 '}
              {category}
            </h3>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} {item.unit} · 用于：{item.recipes.join('、')}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    ¥{item.estimatedPrice.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 底部操作栏 */}
        <div className="fixed bottom-[80px] left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white/90 to-transparent">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('recipes')}
              className="flex-1 btn btn-ghost"
            >
              ← 返回菜谱
            </button>
            <button
              onClick={() => setViewMode('ingredients')}
              className="flex-1 btn btn-secondary"
            >
              🏠 返回首页
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-primary/5 to-white">
      <Header
        title="🤖 AI 菜谱推荐"
        showNotification
        onBack={() => window.history.back()}
      />

      <div className="px-4 py-6">
        {viewMode === 'ingredients' && renderIngredientsView()}
        {viewMode === 'recipes' && renderRecipesView()}
        {viewMode === 'shopping' && renderShoppingView()}
      </div>

      <TabBar activeTab="fridge" />
    </div>
  );
}
