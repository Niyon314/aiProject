import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealWishStore } from '../store/mealWishStore';
import { useFridgeStore } from '../store/fridgeStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

// 预设菜谱（增强版）
const recipes = [
  { name: '西红柿炒蛋', icon: '🍳', tags: ['快手', '中餐'], reason: '经典家常菜，简单又美味~' },
  { name: '红烧肉', icon: '🥩', tags: ['硬菜', '中餐'], reason: '香浓入味，超级下饭！' },
  { name: '清炒时蔬', icon: '🥬', tags: ['快手', '健康'], reason: '健康清爽，补充维生素~' },
  { name: '宫保鸡丁', icon: '🍗', tags: ['中餐', '下饭'], reason: '酸辣开胃，百吃不厌！' },
  { name: '麻婆豆腐', icon: '🌶️', tags: ['中餐', '下饭'], reason: '麻辣鲜香，米饭杀手~' },
  { name: '蔬菜沙拉', icon: '🥗', tags: ['快手', '健康'], reason: '低卡健康，减肥必备~' },
  { name: '牛肉炒面', icon: '🍜', tags: ['快手', '主食'], reason: '香浓劲道，饱腹感强！' },
  { name: '土豆炖牛肉', icon: '🥘', tags: ['硬菜', '中餐'], reason: '软烂入味，温暖治愈~' },
  { name: '可乐鸡翅', icon: '🍗', tags: ['简单', '肉食'], reason: '甜香入味，新手必学！' },
  { name: '酸辣粉', icon: '🍜', tags: ['快手', '小吃'], reason: '酸辣过瘾，解馋神器~' },
  { name: '糖醋排骨', icon: '🍖', tags: ['硬菜', '中餐'], reason: '酸甜可口，颜值担当！' },
  { name: '蒸蛋羹', icon: '🥚', tags: ['快手', '健康'], reason: '嫩滑可口，老少皆宜~' },
  { name: '火锅', icon: '🫕', tags: ['硬菜', '聚餐'], reason: '什么都能涮，万能选择！' },
  { name: '寿司', icon: '🍣', tags: ['日料', '精致'], reason: '精致美味，约会首选~' },
  { name: '烤鱼', icon: '🐟', tags: ['硬菜', '聚餐'], reason: '香辣烤鱼，越吃越上头！' },
  { name: '螺蛳粉', icon: '🍜', tags: ['小吃', '重口'], reason: '闻着臭吃着香！' },
];

export default function MealHome() {
  const navigate = useNavigate();
  const { wishes, loadWishes } = useMealWishStore();
  const { items: fridgeItems, loadItems: loadFridgeItems } = useFridgeStore();
  const [currentRecipe, setCurrentRecipe] = useState(recipes[0]);
  const [isShaking, setIsShaking] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);
  const [wishForm, setWishForm] = useState<{ name: string; icon: string; category: string; priority: string; note: string }>({ name: '', icon: '🍽️', category: 'home_cook', priority: 'want', note: '' });

  useEffect(() => {
    loadWishes('pending');
    loadFridgeItems();
    shakeRecommend();
  }, []);

  const shakeRecommend = () => {
    setIsShaking(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * recipes.length);
      setCurrentRecipe(recipes[idx]);
      setIsShaking(false);
    }, 400);
  };

  const handleAddWish = async () => {
    if (!wishForm.name.trim()) return;
    const { addWish } = useMealWishStore.getState();
    await addWish({
      name: wishForm.name,
      icon: wishForm.icon,
      category: wishForm.category as 'home_cook' | 'restaurant' | 'takeout' | 'snack',
      priority: wishForm.priority as 'must_eat' | 'want' | 'maybe',
      note: wishForm.note,
      addedBy: 'user',
      status: 'pending',
    });
    setWishForm({ name: '', icon: '🍽️', category: 'home_cook', priority: 'want', note: '' });
    setShowAddWish(false);
    loadWishes('pending');
  };

  const pendingWishes = wishes.filter(w => w.status === 'pending');
  const fridgeCount = fridgeItems.filter(i => i.status !== 'expired').length;

  const priorityConfig = {
    must_eat: { label: '超想吃', color: 'bg-red-100 text-red-600', badge: '🔥' },
    want: { label: '想吃', color: 'bg-orange-100 text-orange-600', badge: '😋' },
    maybe: { label: '有空再说', color: 'bg-gray-100 text-gray-600', badge: '🤔' },
  };

  const categoryIcons: Record<string, string> = {
    home_cook: '🏠 自己做',
    restaurant: '🍽️ 下馆子',
    takeout: '🛵 外卖',
    snack: '🍿 小吃',
  };

  const foodEmojis = ['🍽️', '🍜', '🍣', '🍕', '🥗', '🍱', '🍔', '🌮', '🍳', '🥘', '🍲', '🥪', '🫕', '🍗', '🥩', '🍖'];

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header
        title="🍽️ 今天吃什么"
        showNotification
        onBack={() => navigate('/')}
      />

      <div className="px-4 py-6 space-y-6">
        {/* 🎲 随机推荐卡片 */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-pink-200 overflow-hidden">
          <div className="bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 p-6 text-center">
            <div className={`text-7xl mb-3 ${isShaking ? 'animate-bounce' : ''}`}>
              {currentRecipe.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {currentRecipe.name}
            </h2>
            <div className="flex justify-center gap-2 mb-2">
              {currentRecipe.tags.map(tag => (
                <span key={tag} className="bg-white/80 text-pink-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-gray-600 text-sm">💡 {currentRecipe.reason}</p>
          </div>

          <div className="p-4 flex gap-3">
            <button
              onClick={shakeRecommend}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-md hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              🎲 换一个
            </button>
            <button
              onClick={() => navigate('/eating/random')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              🧊 结合冰箱推荐
            </button>
          </div>
        </div>

        {/* 📝 想吃清单 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-lg font-bold">📝 想吃清单</h3>
            <button
              onClick={() => setShowAddWish(true)}
              className="bg-white/30 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-white/40 transition-all"
            >
              ＋ 添加
            </button>
          </div>

          {pendingWishes.length > 0 ? (
            <div className="space-y-3">
              {pendingWishes.slice(0, 5).map(wish => (
                <div key={wish.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <span className="text-3xl">{wish.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 truncate">{wish.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityConfig[wish.priority].color}`}>
                        {priorityConfig[wish.priority].badge} {priorityConfig[wish.priority].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {categoryIcons[wish.category]} · {wish.addedBy === 'user' ? '我' : 'TA'} 添加的
                    </p>
                    {wish.note && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">💬 {wish.note}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const { markDone } = useMealWishStore.getState();
                      await markDone(wish.id);
                      loadWishes('pending');
                    }}
                    className="bg-green-100 text-green-600 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-green-200 transition-all whitespace-nowrap"
                  >
                    ✅ 吃了
                  </button>
                </div>
              ))}

              {pendingWishes.length > 5 && (
                <button
                  onClick={() => navigate('/meal/wishlist')}
                  className="w-full text-center text-white/80 text-sm py-2 hover:text-white transition-colors"
                >
                  查看全部 {pendingWishes.length} 个 →
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
              <p className="text-4xl mb-2">🤤</p>
              <p className="text-sm">还没有想吃的？</p>
              <p className="text-xs opacity-80">突然想吃什么，加到清单里吧~</p>
            </div>
          )}
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/eating/random')}
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-3xl block mb-1">🎲</span>
            <p className="text-sm font-semibold text-gray-800">智能推荐</p>
            <p className="text-xs text-gray-500">结合冰箱</p>
          </button>
          <button
            onClick={() => navigate('/meal/wishlist')}
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-3xl block mb-1">📝</span>
            <p className="text-sm font-semibold text-gray-800">想吃清单</p>
            <p className="text-xs text-gray-500">{pendingWishes.length} 个待吃</p>
          </button>
          <button
            onClick={() => navigate('/fridge/ai-recipes')}
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-3xl block mb-1">🤖</span>
            <p className="text-sm font-semibold text-gray-800">AI 菜谱</p>
            <p className="text-xs text-gray-500">{fridgeCount} 种食材</p>
          </button>
        </div>

        {/* 冰箱状态提示 */}
        {fridgeCount > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">🧊 冰箱里有 {fridgeCount} 种食材</h3>
              <button
                onClick={() => navigate('/fridge')}
                className="text-white/80 text-xs hover:text-white"
              >
                管理 →
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fridgeItems
                .filter(item => item.status !== 'expired')
                .slice(0, 8)
                .map((item, idx) => (
                  <span key={idx} className="bg-white/30 text-white px-2 py-0.5 rounded-full text-xs">
                    {item.name}
                  </span>
                ))}
              {fridgeCount > 8 && (
                <span className="text-white/60 text-xs px-2 py-0.5">+{fridgeCount - 8}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 添加想吃弹窗 */}
      {showAddWish && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end animate-fade-in">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-bold text-xl text-gray-800">🤤 添加想吃的</h2>
              <button onClick={() => setShowAddWish(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <span className="text-2xl text-gray-500">✕</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 名称 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">想吃什么？ *</label>
                <input
                  type="text"
                  value={wishForm.name}
                  onChange={e => setWishForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="火锅、日料、妈妈做的红烧肉..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>

              {/* 图标 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">选个图标</label>
                <div className="grid grid-cols-8 gap-2">
                  {foodEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setWishForm(f => ({ ...f, icon: emoji }))}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        wishForm.icon === emoji ? 'bg-pink-100 ring-2 ring-pink-500' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">怎么吃？</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: 'home_cook', label: '🏠 自己做' },
                    { value: 'restaurant', label: '🍽️ 下馆子' },
                    { value: 'takeout', label: '🛵 外卖' },
                    { value: 'snack', label: '🍿 小吃' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWishForm(f => ({ ...f, category: opt.value }))}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                        wishForm.category === opt.value
                          ? 'bg-pink-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 优先级 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">多想吃？</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'must_eat', label: '🔥 超想吃', color: 'bg-red-500' },
                    { value: 'want', label: '😋 想吃', color: 'bg-orange-500' },
                    { value: 'maybe', label: '🤔 有空再说', color: 'bg-gray-500' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWishForm(f => ({ ...f, priority: opt.value }))}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                        wishForm.priority === opt.value
                          ? `${opt.color} text-white shadow-md`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">备注（可选）</label>
                <input
                  type="text"
                  value={wishForm.note}
                  onChange={e => setWishForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="上次在XX吃的那家超好吃..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>

              {/* 提交 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddWish(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddWish}
                  disabled={!wishForm.name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-md disabled:opacity-50"
                >
                  ✨ 加入清单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TabBar activeTab="home" />
    </div>
  );
}
