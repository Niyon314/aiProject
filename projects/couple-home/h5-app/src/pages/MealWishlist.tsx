import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealWishStore } from '../store/mealWishStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

export default function MealWishlist() {
  const navigate = useNavigate();
  const { wishes, loadWishes, deleteWish, markDone } = useMealWishStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'done'>('pending');
  const [showAddWish, setShowAddWish] = useState(false);
  const [wishForm, setWishForm] = useState<{ name: string; icon: string; category: string; priority: string; note: string }>({ name: '', icon: '🍽️', category: 'home_cook', priority: 'want', note: '' });

  useEffect(() => {
    loadWishes();
  }, []);

  const filteredWishes = wishes.filter(w => activeTab === 'pending' ? w.status === 'pending' : w.status === 'done');

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
  };

  const priorityConfig = {
    must_eat: { label: '超想吃', color: 'bg-red-100 text-red-600 border-red-200', badge: '🔥', sort: 0 },
    want: { label: '想吃', color: 'bg-orange-100 text-orange-600 border-orange-200', badge: '😋', sort: 1 },
    maybe: { label: '有空再说', color: 'bg-gray-100 text-gray-500 border-gray-200', badge: '🤔', sort: 2 },
  };

  const categoryIcons: Record<string, string> = {
    home_cook: '🏠',
    restaurant: '🍽️',
    takeout: '🛵',
    snack: '🍿',
  };

  const foodEmojis = ['🍽️', '🍜', '🍣', '🍕', '🥗', '🍱', '🍔', '🌮', '🍳', '🥘', '🍲', '🥪', '🫕', '🍗', '🥩', '🍖'];

  // 按优先级排序
  const sortedWishes = [...filteredWishes].sort((a, b) =>
    (priorityConfig[a.priority]?.sort || 2) - (priorityConfig[b.priority]?.sort || 2)
  );

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header
        title="📝 想吃清单"
        showNotification
        onBack={() => navigate('/meal')}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Tab 切换 */}
        <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'pending' ? 'bg-white text-pink-600 shadow-sm' : 'text-white/80'
            }`}
          >
            🤤 想吃 ({wishes.filter(w => w.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'done' ? 'bg-white text-green-600 shadow-sm' : 'text-white/80'
            }`}
          >
            ✅ 已吃 ({wishes.filter(w => w.status === 'done').length})
          </button>
        </div>

        {/* 列表 */}
        {sortedWishes.length > 0 ? (
          <div className="space-y-3">
            {sortedWishes.map(wish => (
              <div key={wish.id} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${priorityConfig[wish.priority]?.color?.split(' ')[0] ? `border-l-${priorityConfig[wish.priority]?.color?.includes('red') ? 'red' : priorityConfig[wish.priority]?.color?.includes('orange') ? 'orange' : 'gray'}-400` : 'border-l-gray-300'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{wish.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{wish.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityConfig[wish.priority]?.color || 'bg-gray-100 text-gray-500'}`}>
                        {priorityConfig[wish.priority]?.badge} {priorityConfig[wish.priority]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryIcons[wish.category] || '🍽️'} {
                        wish.category === 'home_cook' ? '自己做' :
                        wish.category === 'restaurant' ? '下馆子' :
                        wish.category === 'takeout' ? '外卖' : '小吃'
                      }
                      {' · '}
                      {wish.addedBy === 'user' ? '我' : 'TA'} 添加
                      {wish.doneAt && ` · ${new Date(wish.doneAt).toLocaleDateString('zh-CN')} 吃的`}
                    </p>
                    {wish.note && (
                      <p className="text-xs text-gray-400 mt-1">💬 {wish.note}</p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {wish.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => markDone(wish.id)}
                        className="bg-green-100 text-green-600 p-2 rounded-xl text-sm hover:bg-green-200 transition-all"
                        title="吃了！"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => deleteWish(wish.id)}
                        className="bg-gray-100 text-gray-400 p-2 rounded-xl text-sm hover:bg-red-100 hover:text-red-500 transition-all"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
            <p className="text-5xl mb-3">{activeTab === 'pending' ? '🤤' : '🎉'}</p>
            <p className="text-lg font-semibold">{activeTab === 'pending' ? '清单空空的' : '还没吃过呢'}</p>
            <p className="text-sm opacity-80 mt-1">{activeTab === 'pending' ? '想吃什么就添加吧~' : '把想吃的标记为已吃会出现在这里'}</p>
          </div>
        )}

        {/* 添加按钮 */}
        {activeTab === 'pending' && (
          <button
            onClick={() => setShowAddWish(true)}
            className="w-full py-4 bg-white rounded-2xl shadow-sm text-center font-semibold text-pink-600 hover:bg-pink-50 transition-all border-2 border-dashed border-pink-300"
          >
            ＋ 添加想吃的
          </button>
        )}
      </div>

      {/* 添加弹窗 */}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">想吃什么？ *</label>
                <input
                  type="text"
                  value={wishForm.name}
                  onChange={e => setWishForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="火锅、日料、妈妈做的红烧肉..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">备注（可选）</label>
                <input
                  type="text"
                  value={wishForm.note}
                  onChange={e => setWishForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="上次在XX吃的那家超好吃..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

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
