import { useState, useEffect } from 'react';
import { wishlistApi, type WishlistItem, type CreateWishlistItemRequest } from '../api/wishlistApi';
import TabBar from '../components/TabBar';
import Header from '../components/Header';

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [contributeAmount, setContributeAmount] = useState('');

  // 表单状态
  const [formData, setFormData] = useState<CreateWishlistItemRequest>({
    title: '',
    description: '',
    budget: 0,
    priority: 3,
    deadline: '',
  });

  useEffect(() => {
    loadWishlist();
  }, [filter]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await wishlistApi.getAll({ status, pageSize: 50 });
      setItems(response.items);
    } catch (error) {
      console.error('加载愿望列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = async () => {
    if (!formData.title.trim() || formData.budget <= 0) {
      alert('请填写完整的愿望信息');
      return;
    }

    try {
      await wishlistApi.create(formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        budget: 0,
        priority: 3,
        deadline: '',
      });
      loadWishlist();
    } catch (error) {
      console.error('创建愿望失败:', error);
      alert('创建失败，请重试');
    }
  };

  const handleContribute = async () => {
    if (!selectedItem || !contributeAmount || parseFloat(contributeAmount) <= 0) {
      alert('请输入有效的金额');
      return;
    }

    try {
      await wishlistApi.contribute(selectedItem.id, parseFloat(contributeAmount));
      setShowContributeModal(false);
      setContributeAmount('');
      setSelectedItem(null);
      loadWishlist();
    } catch (error) {
      console.error('助力失败:', error);
      alert('助力失败，请重试');
    }
  };

  const handleComplete = async (item: WishlistItem) => {
    if (!confirm(`确定要标记"${item.title}"为已完成吗？🎉`)) {
      return;
    }

    try {
      await wishlistApi.complete(item.id);
      loadWishlist();
    } catch (error) {
      console.error('标记完成失败:', error);
      alert('操作失败，请重试');
    }
  };

  const handleDelete = async (item: WishlistItem) => {
    if (!confirm(`确定要删除"${item.title}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await wishlistApi.delete(item.id);
      loadWishlist();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getPriorityStars = (priority: number) => {
    return '⭐'.repeat(priority);
  };

  const getPriorityColor = (priority: number) => {
    const colors: Record<number, string> = {
      5: '#FF4757',
      4: '#FFA502',
      3: '#FFD93D',
      2: '#4A90D9',
      1: '#A0A0A0',
    };
    return colors[priority] || colors[3];
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const completedCount = items.filter(i => i.status === 'completed').length;
  const totalProgress = items.length > 0 
    ? ((completedCount / items.length) * 100).toFixed(0) 
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">🎯</div>
          <p className="text-white text-lg font-heading">加载中，马上就好~</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header title="愿望清单" showNotification />
      
      <div className="px-4 py-6 space-y-6">
        {/* 总览卡片 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-md p-4 text-white">
          <h2 className="text-lg font-heading font-semibold mb-3">🎯 我们的愿望</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">已实现 {completedCount}/{items.length} 个</span>
            <span className="text-sm font-bold">{totalProgress}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-400 to-pink-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-white text-pink-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待实现' : '已完成'}
            </button>
          ))}
        </div>

        {/* 待实现愿望 */}
        {filter !== 'completed' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-heading font-semibold">
                ✨ 待实现
              </h3>
            </div>

            {items.filter(i => i.status === 'pending').length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white">
                <p className="text-4xl mb-2">🌸</p>
                <p className="text-sm">还没有待实现的愿望</p>
                <p className="text-xs opacity-80">点击上方 + 创建第一个愿望</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.filter(i => i.status === 'pending').map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-md p-4 animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-gray-800 font-heading font-semibold text-lg">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs mb-1">
                          {getPriorityStars(item.priority)}
                        </div>
                        <span 
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-600"
                        >
                          待实现
                        </span>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">已存 {formatCurrency(item.currentAmount)}</span>
                        <span className="text-gray-600">目标 {formatCurrency(item.budget)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-pink-400 to-pink-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-pink-600 font-medium mt-1">
                        {item.progress.toFixed(1)}%
                      </div>
                    </div>

                    {/* 截止日期 */}
                    {item.deadline && (
                      <div className="text-xs text-gray-500 mb-3">
                        📅 计划：{wishlistApi.formatDate(item.deadline)}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowContributeModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-pink-700 transition-all active:scale-95"
                      >
                        💰 助力
                      </button>
                      <button
                        onClick={() => handleComplete(item)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all active:scale-95"
                      >
                        ✅ 完成
                      </button>
                    </div>

                    {/* 我的助力 */}
                    {item.myContribution > 0 && (
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        💝 我已助力 {formatCurrency(item.myContribution)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 已完成愿望 */}
        {(filter === 'all' || filter === 'completed') && (
          <>
            <div className="flex items-center justify-between mt-6">
              <h3 className="text-white text-lg font-heading font-semibold">
                🎉 已实现
              </h3>
            </div>

            {items.filter(i => i.status === 'completed').length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-md p-6 text-center text-white">
                <p className="text-4xl mb-2">🌟</p>
                <p className="text-sm">还没有已实现的愿望</p>
                <p className="text-xs opacity-80">一起努力实现第一个愿望吧</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.filter(i => i.status === 'completed').map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-md p-4 animate-fade-in opacity-80"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-gray-800 font-heading font-semibold text-lg line-through">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs mb-1">
                          {getPriorityStars(item.priority)}
                        </div>
                        <span 
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600"
                        >
                          ✅ 已完成
                        </span>
                      </div>
                    </div>

                    {item.completedAt && (
                      <div className="text-xs text-green-600 mb-2">
                        🎉 {wishlistApi.formatDate(item.completedAt)} 完成
                      </div>
                    )}

                    <div className="text-right">
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 添加愿望按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-[100px] right-4 w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white text-3xl hover:from-pink-600 hover:to-pink-700 transition-all active:scale-90 animate-float"
      >
        ➕
      </button>

      <TabBar activeTab="wishlist" />

      {/* 添加愿望弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold text-gray-800">🎯 创建新愿望</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  愿望名称 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：去日本旅行"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  愿望描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="详细描述一下这个愿望..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预算金额 (¥) *
                </label>
                <input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优先级 (想要程度)
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, priority: star })}
                      className={`text-3xl transition-all ${
                        formData.priority >= star ? 'opacity-100 scale-110' : 'opacity-30'
                      }`}
                      style={{ color: getPriorityColor(star) }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {formData.priority === 5 ? '非常想要' : 
                   formData.priority === 4 ? '很想要' :
                   formData.priority === 3 ? '想要' :
                   formData.priority === 2 ? '可以考虑' : '随便'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  计划完成日期
                </label>
                <input
                  type="date"
                  value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deadline: e.target.value ? new Date(e.target.value).toISOString() : '' 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleCreateWishlist}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all active:scale-95"
              >
                ✨ 创建愿望
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 助力弹窗 */}
      {showContributeModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold text-gray-800">💰 为愿望助力</h3>
              <button
                onClick={() => {
                  setShowContributeModal(false);
                  setSelectedItem(null);
                  setContributeAmount('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">{selectedItem.title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>已存：{formatCurrency(selectedItem.currentAmount)}</span>
                <span>目标：{formatCurrency(selectedItem.budget)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-pink-600 h-full rounded-full"
                  style={{ width: `${selectedItem.progress}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                助力金额 (¥)
              </label>
              <input
                type="number"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-4">
              {[10, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setContributeAmount(amount.toString())}
                  className="flex-1 bg-pink-100 text-pink-600 py-2 rounded-full text-sm font-medium hover:bg-pink-200 transition-all"
                >
                  ¥{amount}
                </button>
              ))}
            </div>

            <button
              onClick={handleContribute}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-full font-semibold mt-6 hover:from-pink-600 hover:to-pink-700 transition-all active:scale-95"
            >
              💝 确认助力
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
