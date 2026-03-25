import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { Bill, Fund, Favor } from '../utils/db';

type ViewMode = 'bills' | 'fund' | 'favor';

export default function Bills() {
  const { 
    bills, 
    loadBills, 
    addBill, 
    confirmBill, 
    settings,
    funds,
    loadFunds,
    addFund,
    updateFund,
    favors,
    loadFavors,
    addFavor,
  } = useAppStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showFavorForm, setShowFavorForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('bills');

  useEffect(() => {
    loadBills();
    loadFunds();
    loadFavors();
  }, []);

  const pendingBills = bills.filter(b => b.status === 'pending');
  const confirmedBills = bills.filter(b => b.status === 'confirmed');

  // 计算贡献统计
  const userPaid = confirmedBills
    .filter(b => b.payer === 'user')
    .reduce((sum, b) => sum + b.amount, 0);
  
  const partnerPaid = confirmedBills
    .filter(b => b.payer === 'partner')
    .reduce((sum, b) => sum + b.amount, 0);
  
  const total = userPaid + partnerPaid;
  
  const userPercentage = total > 0 ? ((userPaid / total) * 100).toFixed(1) : '0';
  const partnerPercentage = total > 0 ? ((partnerPaid / total) * 100).toFixed(1) : '0';

  // 共同基金总计
  const totalFundAmount = funds.reduce((sum, fund) => sum + fund.currentAmount, 0);
  const totalFundTarget = funds.reduce((sum, fund) => sum + fund.targetAmount, 0);

  // 人情统计
  const totalGive = favors.filter(f => f.type === 'give').reduce((sum, f) => sum + f.amount, 0);
  const totalReceive = favors.filter(f => f.type === 'receive').reduce((sum, f) => sum + f.amount, 0);

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

  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newFund: Fund = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      currentAmount: 0,
      icon: formData.get('icon') as string,
      deadline: formData.get('deadline') as string || undefined,
    };

    await addFund(newFund);
    setShowFundForm(false);
  };

  const handleContributeFund = async (fund: Fund, amount: number) => {
    await updateFund(fund.id, { currentAmount: fund.currentAmount + amount });
  };

  const handleAddFavor = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newFavor: Favor = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as 'give' | 'receive',
      person: formData.get('person') as string,
      date: formData.get('date') as string,
      note: formData.get('note') as string,
    };

    await addFavor(newFavor);
    setShowFavorForm(false);
  };

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="💰 账单管理" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 视图切换 */}
        <div className="flex bg-white/50 rounded-md p-1">
          <button
            onClick={() => setViewMode('bills')}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${
              viewMode === 'bills' 
                ? 'bg-white text-primary-dark shadow-sm' 
                : 'text-gray-500'
            }`}
          >
            📝 账单
          </button>
          <button
            onClick={() => setViewMode('fund')}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${
              viewMode === 'fund' 
                ? 'bg-white text-primary-dark shadow-sm' 
                : 'text-gray-500'
            }`}
          >
            💎 共同基金
          </button>
          <button
            onClick={() => setViewMode('favor')}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${
              viewMode === 'favor' 
                ? 'bg-white text-primary-dark shadow-sm' 
                : 'text-gray-500'
            }`}
          >
            🎁 人情记录
          </button>
        </div>

        {/* 账单视图 */}
        {viewMode === 'bills' && (
          <>
            {/* 贡献统计 */}
            <div className="bg-white rounded-md p-4 shadow-md border border-primary-light">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">
                📊 贡献统计
              </h3>
              
              <div className="space-y-3">
                {/* 进度条 */}
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all"
                    style={{ width: `${userPercentage}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-full transition-all"
                    style={{ width: `${partnerPercentage}%` }}
                  />
                </div>
                
                {/* 统计 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-pink-50 rounded-md">
                    <p className="text-sm text-pink-600">{settings?.nickname}</p>
                    <p className="text-xl font-bold text-pink-700">¥{userPaid.toFixed(2)}</p>
                    <p className="text-xs text-pink-500">{userPercentage}%</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-600">{settings?.partnerNickname}</p>
                    <p className="text-xl font-bold text-blue-700">¥{partnerPaid.toFixed(2)}</p>
                    <p className="text-xs text-blue-500">{partnerPercentage}%</p>
                  </div>
                </div>
                
                <div className="text-center pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    总计支出：<span className="font-bold text-primary-dark">¥{total.toFixed(2)}</span>
                  </p>
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
                        👤 {bill.payer === 'user' ? settings?.nickname : settings?.partnerNickname} 支付
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
                        <div className="text-right">
                          <span className="text-gray-600 font-semibold block">
                            ¥{bill.amount.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {bill.payer === 'user' ? settings?.nickname : settings?.partnerNickname}
                          </span>
                        </div>
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
          </>
        )}

        {/* 共同基金视图 */}
        {viewMode === 'fund' && (
          <>
            {/* 基金总览 */}
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-md p-4 border-2 border-amber-300">
              <h3 className="font-heading font-semibold text-amber-900 mb-2">
                💎 共同基金总览
              </h3>
              <p className="text-3xl font-bold text-amber-700">
                ¥{totalFundAmount.toFixed(2)}
              </p>
              <p className="text-sm text-amber-600">
                目标：¥{totalFundTarget.toFixed(2)}
              </p>
              <div className="mt-2 h-3 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all"
                  style={{ width: `${totalFundTarget > 0 ? (totalFundAmount / totalFundTarget) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 基金列表 */}
            <div className="space-y-3">
              {funds.map(fund => (
                <div 
                  key={fund.id}
                  className="bg-white rounded-md p-4 shadow-sm border border-primary-light"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{fund.icon}</span>
                      <div>
                        <p className="font-heading font-semibold text-gray-800">{fund.name}</p>
                        {fund.deadline && (
                          <p className="text-xs text-gray-400">
                            📅 截止：{new Date(fund.deadline).toLocaleDateString('zh-CN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">已存：¥{fund.currentAmount.toFixed(2)}</span>
                      <span className="text-gray-600">目标：¥{fund.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all"
                        style={{ width: `${(fund.currentAmount / fund.targetAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleContributeFund(fund, 100)}
                    className="w-full btn btn-secondary py-2 text-sm"
                  >
                    💰 存入 ¥100
                  </button>
                </div>
              ))}
              
              {funds.length === 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-md p-8 text-center">
                  <p className="text-5xl mb-3">💎</p>
                  <p className="text-gray-600 font-semibold">还没有共同基金</p>
                  <p className="text-sm text-gray-400 mt-1">点击下方按钮创建第一个基金</p>
                </div>
              )}
            </div>

            {/* 添加基金按钮 */}
            <button
              onClick={() => setShowFundForm(true)}
              className="fixed bottom-[80px] right-4 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg text-white text-3xl flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
            >
              ➕
            </button>
          </>
        )}

        {/* 人情记录视图 */}
        {viewMode === 'favor' && (
          <>
            {/* 人情统计 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-md p-4 border border-red-200">
                <p className="text-sm text-red-600 mb-1">💝 送出人情</p>
                <p className="text-2xl font-bold text-red-700">¥{totalGive.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-md p-4 border border-green-200">
                <p className="text-sm text-green-600 mb-1">🎁 收到人情</p>
                <p className="text-2xl font-bold text-green-700">¥{totalReceive.toFixed(2)}</p>
              </div>
            </div>

            {/* 人情列表 */}
            <div className="space-y-3">
              {favors.map(favor => (
                <div 
                  key={favor.id}
                  className={`bg-white rounded-md p-4 shadow-sm border ${
                    favor.type === 'give' ? 'border-red-200' : 'border-green-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{favor.type === 'give' ? '💝' : '🎁'}</span>
                      <div>
                        <p className="font-heading font-semibold text-gray-800">{favor.title}</p>
                        <p className="text-sm text-gray-500">
                          👤 {favor.person} · 📅 {new Date(favor.date).toLocaleDateString('zh-CN')}
                        </p>
                        {favor.note && (
                          <p className="text-xs text-gray-400 mt-1">📝 {favor.note}</p>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold text-lg ${
                      favor.type === 'give' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {favor.type === 'give' ? '-' : '+'}¥{favor.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              
              {favors.length === 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-md p-8 text-center">
                  <p className="text-5xl mb-3">🎁</p>
                  <p className="text-gray-600 font-semibold">还没有人情记录</p>
                  <p className="text-sm text-gray-400 mt-1">点击下方按钮添加</p>
                </div>
              )}
            </div>

            {/* 添加人情按钮 */}
            <button
              onClick={() => setShowFavorForm(true)}
              className="fixed bottom-[80px] right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg text-white text-3xl flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
            >
              ➕
            </button>
          </>
        )}

        {/* 添加账单表单 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end">
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
                    支付人
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

        {/* 添加基金表单 */}
        {showFundForm && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end">
            <div className="bg-white rounded-t-lg w-full p-6 animate-slide-in">
              <h3 className="text-lg font-heading font-semibold mb-4">创建共同基金</h3>
              
              <form onSubmit={handleAddFund} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    基金名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input"
                    placeholder="例如：旅游基金、装修基金..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    目标金额
                  </label>
                  <input
                    type="number"
                    name="targetAmount"
                    required
                    step="0.01"
                    className="input"
                    placeholder="10000.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    图标
                  </label>
                  <select
                    name="icon"
                    className="input"
                  >
                    <option value="💎">💎 钻石</option>
                    <option value="✈️">✈️ 旅行</option>
                    <option value="🏠">🏠 房子</option>
                    <option value="🚗">🚗 车子</option>
                    <option value="💍">💍 戒指</option>
                    <option value="👶">👶 宝宝</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    截止日期（可选）
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    className="input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFundForm(false)}
                    className="flex-1 btn btn-ghost"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 添加人情表单 */}
        {showFavorForm && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end">
            <div className="bg-white rounded-t-lg w-full p-6 animate-slide-in">
              <h3 className="text-lg font-heading font-semibold mb-4">添加人情记录</h3>
              
              <form onSubmit={handleAddFavor} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    name="type"
                    className="input"
                  >
                    <option value="give">💝 送出人情</option>
                    <option value="receive">🎁 收到人情</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    标题
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input"
                    placeholder="例如：生日红包、结婚礼金..."
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
                    对象
                  </label>
                  <input
                    type="text"
                    name="person"
                    required
                    className="input"
                    placeholder="例如：小王、同事..."
                  />
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
                    备注（可选）
                  </label>
                  <textarea
                    name="note"
                    className="input"
                    placeholder="添加一些说明..."
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFavorForm(false)}
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

      <TabBar activeTab="profile" />
    </div>
  );
}
