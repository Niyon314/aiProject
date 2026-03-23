import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { FridgeItem } from '../utils/db';

type Category = 'all' | 'vegetable' | 'meat' | 'egg' | 'staple' | 'other';

const categoryIcons: Record<Category, string> = {
  all: '🏠',
  vegetable: '🥬',
  meat: '🥩',
  egg: '🥚',
  staple: '🍚',
  other: '📦',
};

const categoryLabels: Record<Category, string> = {
  all: '全部',
  vegetable: '蔬菜',
  meat: '肉类',
  egg: '蛋类',
  staple: '主食',
  other: '其他',
};

export default function Fridge() {
  const { 
    fridgeItems, 
    loadFridgeItems, 
    addFridgeItem, 
    updateFridgeItem, 
    deleteFridgeItem,
    checkExpiryStatus,
  } = useAppStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  useEffect(() => {
    loadFridgeItems();
  }, []);

  // 过滤和排序食材
  const filteredItems = fridgeItems
    .filter(item => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    })
    .sort((a, b) => {
      // 临期的排前面
      const statusOrder = { warning: 0, fresh: 1, expired: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // 然后按过期日期排序
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const expiryDate = formData.get('expiryDate') as string;
    const status = checkExpiryStatus(expiryDate);
    
    // 修复：使用完整 ISO 8601 格式，避免时区问题
    const newItem: FridgeItem = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      quantity: parseFloat(formData.get('quantity') as string),
      unit: formData.get('unit') as string,
      category: formData.get('category') as FridgeItem['category'],
      expiryDate: new Date(expiryDate).toISOString(), // 转换为完整 ISO 格式
      addedDate: new Date().toISOString(),
      status,
    };

    await addFridgeItem(newItem);
    setShowAddModal(false);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const expiryDate = formData.get('expiryDate') as string;
    const status = checkExpiryStatus(expiryDate);
    
    // 修复：使用完整 ISO 8601 格式
    await updateFridgeItem(editingItem.id, {
      name: formData.get('name') as string,
      quantity: parseFloat(formData.get('quantity') as string),
      unit: formData.get('unit') as string,
      category: formData.get('category') as FridgeItem['category'],
      expiryDate: new Date(expiryDate).toISOString(), // 转换为完整 ISO 格式
      status,
    });
    
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个食材吗？')) {
      await deleteFridgeItem(id);
    }
  };

  const getStatusIcon = (status: FridgeItem['status']) => {
    switch (status) {
      case 'expired': return '❌';
      case 'warning': return '⚠️';
      case 'fresh': return '✅';
    }
  };

  const getStatusBorder = (status: FridgeItem['status']) => {
    switch (status) {
      case 'expired': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-orange-400 bg-orange-50';
      case 'fresh': return 'border-green-300';
    }
  };

  const categories: Category[] = ['all', 'vegetable', 'meat', 'egg', 'staple', 'other'];

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="🧊 冰箱管理" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 分类筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-primary-dark shadow-md'
                  : 'bg-white/50 text-gray-600'
              }`}
            >
              <span>{categoryIcons[cat]}</span>
              <span className="text-sm font-semibold">{categoryLabels[cat]}</span>
            </button>
          ))}
        </div>

        {/* 食材列表 */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-md p-4 shadow-sm border-2 transition-all ${getStatusBorder(item.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcons[item.category]}</span>
                    <div>
                      <p className="font-heading font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl">{getStatusIcon(item.status)}</span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm">
                    <p className="text-gray-600">
                      📅 过期：{new Date(item.expiryDate).toLocaleDateString('zh-CN')}
                    </p>
                    {item.status === 'warning' && (
                      <p className="text-orange-600 font-semibold text-xs mt-1">
                        ⚠️ 临期提醒，尽快食用！
                      </p>
                    )}
                    {item.status === 'expired' && (
                      <p className="text-red-600 font-semibold text-xs mt-1">
                        ❌ 已过期，请勿食用！
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-3 py-1 text-sm btn btn-secondary"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-sm btn btn-ghost text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-md p-8 text-center">
            <p className="text-5xl mb-3">🧊</p>
            <p className="text-gray-600 font-semibold">冰箱是空的哦~</p>
            <p className="text-sm text-gray-400 mt-1">点击下方按钮添加食材</p>
          </div>
        )}

        {/* 添加按钮 */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-[80px] right-4 w-14 h-14 bg-gradient-to-br from-primary-dark to-primary-darker rounded-full shadow-lg text-white text-3xl flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
        >
          ➕
        </button>

        {/* 添加 Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-lg w-full p-6 animate-slide-in">
              <h3 className="text-lg font-heading font-semibold mb-4">添加食材</h3>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input"
                    placeholder="例如：西红柿、鸡蛋..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      数量
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      step="0.1"
                      className="input"
                      placeholder="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      单位
                    </label>
                    <input
                      type="text"
                      name="unit"
                      required
                      className="input"
                      placeholder="个、斤、盒..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    name="category"
                    className="input"
                  >
                    <option value="vegetable">🥬 蔬菜</option>
                    <option value="meat">🥩 肉类</option>
                    <option value="egg">🥚 蛋类</option>
                    <option value="staple">🍚 主食</option>
                    <option value="other">📦 其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    过期日期
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    required
                    className="input"
                    defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn btn-ghost"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 编辑 Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
            <div className="bg-white rounded-t-2xl w-full max-w-md p-6 animate-slide-in shadow-2xl">
              <h3 className="text-lg font-heading font-semibold mb-4">编辑食材</h3>
              
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingItem.name}
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      数量
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      step="0.1"
                      defaultValue={editingItem.quantity}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      单位
                    </label>
                    <input
                      type="text"
                      name="unit"
                      required
                      defaultValue={editingItem.unit}
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    name="category"
                    className="input"
                    defaultValue={editingItem.category}
                  >
                    <option value="vegetable">🥬 蔬菜</option>
                    <option value="meat">🥩 肉类</option>
                    <option value="egg">🥚 蛋类</option>
                    <option value="staple">🍚 主食</option>
                    <option value="other">📦 其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    过期日期
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    required
                    defaultValue={editingItem.expiryDate}
                    className="input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 btn btn-ghost"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <TabBar activeTab="fridge" />
    </div>
  );
}
