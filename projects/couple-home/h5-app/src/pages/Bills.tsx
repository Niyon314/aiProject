import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { Bill } from '../utils/db';

export default function Bills() {
  const { bills, loadBills, addBill, confirmBill, settings } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const pendingBills = bills.filter(b => b.status === 'pending');
  const confirmedBills = bills.filter(b => b.status === 'confirmed');

  // 计算 AA
  const userPaid = bills
    .filter(b => b.payer === 'user' && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.amount, 0);
  
  const partnerPaid = bills
    .filter(b => b.payer === 'partner' && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.amount, 0);
  
  const total = userPaid + partnerPaid;
  const eachShare = total / 2;
  const toTransfer = Math.abs(userPaid - eachShare);

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newBill: Bill = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      amount: parseFloat(formData.get('amount') as string),
      payer: formData.get('payer') as 'user' | 'partner',
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      status: 'pending',
    };

    await addBill(newBill);
    setShowAddForm(false);
  };

  const handleConfirm = async (id: string) => {
    await confirmBill(id);
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="账单 AA" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* AA 计算 */}
        <div className="bg-white rounded-md p-4 shadow-md border border-primary-light">
          <h3 className="font-heading font-semibold text-gray-800 mb-3">
            💰 本月待 AA
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{settings?.nickname}垫付：</span>
              <span className="font-semibold">¥{userPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{settings?.partnerNickname}垫付：</span>
              <span className="font-semibold">¥{partnerPaid.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-800 font-semibold">
                  {userPaid > partnerPaid ? settings?.partnerNickname : settings?.nickname}
                  需转给
                  {userPaid > partnerPaid ? settings?.nickname : settings?.partnerNickname}
                  ：
                </span>
                <span className="text-primary-dark font-bold text-lg">
                  ¥{toTransfer.toFixed(2)} 💸
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 待确认 */}
        {pendingBills.length > 0 && (
          <div>
            <h2 className="text-white text-lg font-heading font-semibold mb-3">
              待确认 ({pendingBills.length})
            </h2>
            <div className="space-y-3">
              {pendingBills.map(bill => (
                <div 
                  key={bill.id}
                  className="bg-white rounded-md p-4 shadow-sm border border-primary-light"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-heading font-semibold text-gray-800">
                        🧾 {bill.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 {new Date(bill.date).toLocaleDateString('zh-CN')}
                        {' | '}
                        {bill.category}
                      </p>
                    </div>
                    <span className="text-primary-dark font-bold text-lg">
                      ¥{bill.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    👤 {bill.payer === 'user' ? settings?.nickname : settings?.partnerNickname} 垫付
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(bill.id)}
                      className="flex-1 btn btn-primary py-2 text-sm"
                    >
                      ✅ 确认
                    </button>
                    <button className="flex-1 btn btn-secondary py-2 text-sm">
                      ❌ 有异议
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {confirmedBills.length > 0 && (
          <div>
            <h2 className="text-white text-lg font-heading font-semibold mb-3">
              历史记录 ({confirmedBills.length})
            </h2>
            <div className="space-y-2">
              {confirmedBills.map(bill => (
                <div 
                  key={bill.id}
                  className="bg-white/60 rounded-md p-3 border border-white/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="text-gray-700 font-semibold">{bill.title}</p>
                        <p className="text-xs text-gray-400">
                          📅 {new Date(bill.date).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-600 font-semibold">
                      ¥{bill.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加按钮 */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="fixed bottom-[80px] right-4 w-14 h-14 bg-gradient-to-br from-primary-dark to-primary-darker rounded-full shadow-lg text-white text-3xl flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
        >
          ➕
        </button>

        {/* 添加表单 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white rounded-t-lg w-full p-6 animate-slide-in">
              <h3 className="text-lg font-heading font-semibold mb-4">添加账单</h3>
              
              <form onSubmit={handleAddBill} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    账单名称
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input"
                    placeholder="例如：超市购物、房租..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    金额
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    垫付人
                  </label>
                  <select
                    name="payer"
                    className="input"
                  >
                    <option value="user">{settings?.nickname}</option>
                    <option value="partner">{settings?.partnerNickname}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="input"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    类别
                  </label>
                  <select
                    name="category"
                    className="input"
                  >
                    <option value="food">🍽️ 餐饮</option>
                    <option value="shopping">🛒 购物</option>
                    <option value="rent">🏠 房租</option>
                    <option value="utilities">💡 水电</option>
                    <option value="entertainment">🎬 娱乐</option>
                    <option value="other">📦 其他</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
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
      </div>

      <TabBar activeTab="schedule" />
    </div>
  );
}
