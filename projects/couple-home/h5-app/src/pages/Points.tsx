import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import { pointsApi, type PointsRecord, type ShopItem, type RedeemedCoupon } from '../api/pointsApi';

export default function Points() {
  const { settings } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPoints: 0,
    earnedThisWeek: 0,
    earnedTotal: 0,
    spentTotal: 0,
  });
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [records, setRecords] = useState<PointsRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [redeemedCoupon, setRedeemedCoupon] = useState<RedeemedCoupon | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'records'>('shop');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, shopData, recordsData] = await Promise.all([
        pointsApi.getPointsSummary(),
        pointsApi.getShopItems(),
        pointsApi.getPointsRecords(1, 10),
      ]);
      setSummary(summaryData);
      setShopItems(shopData);
      setRecords(recordsData.records);
    } catch (error) {
      console.error('Failed to load points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedItem) return;

    try {
      const coupon = await pointsApi.redeemItem(selectedItem.id);
      setRedeemedCoupon(coupon);
      setShowRedeemModal(false);
      setShowCouponModal(true);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to redeem:', error);
      alert('兑换失败，积分不足或商品已售罄');
    }
  };

  const copyCouponCode = () => {
    if (redeemedCoupon) {
      navigator.clipboard.writeText(redeemedCoupon.code);
      alert('券码已复制到剪贴板！');
    }
  };

  const getPointsIcon = (source: string) => {
    const icons: Record<string, string> = {
      chore: '🧹',
      vote: '🍽️',
      checkin: '📅',
      message: '💌',
      redeem: '🎁',
    };
    return icons[source] || '⭐';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-heart-beat mb-4">🏆</div>
          <p className="text-white text-lg font-heading">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-b from-primary-light/20 to-transparent">
      <Header 
        title="积分商城" 
        showNotification
        onBack={() => window.history.back()}
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* 积分总览 */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 shadow-lg text-white">
          <div className="text-center mb-4">
            <p className="text-white/80 text-sm mb-1">🎖️ 我的积分</p>
            <p className="text-5xl font-bold font-heading">{summary.totalPoints.toLocaleString()}</p>
            <p className="text-white/80 text-sm mt-2">
              本周获得 <span className="text-yellow-300 font-semibold">+{summary.earnedThisWeek}</span> 分 ⬆️
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.earnedTotal.toLocaleString()}</p>
              <p className="text-xs text-white/70">累计获得</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.spentTotal.toLocaleString()}</p>
              <p className="text-xs text-white/70">累计消耗</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-white/70">当前可用</p>
            </div>
          </div>
        </div>

        {/* 积分获取说明 */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-heading font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>✨</span> 积分获取方式
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <span>✅</span> 完成家务
              </span>
              <span className="text-primary font-semibold">+10 分/次</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <span>🍽️</span> 参与投票
              </span>
              <span className="text-primary font-semibold">+2 分/次</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <span>📅</span> 准时打卡
              </span>
              <span className="text-primary font-semibold">+5 分/次</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <span>💌</span> 写留言
              </span>
              <span className="text-primary font-semibold">+1 分/条</span>
            </div>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'shop'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎁 可兑换商品
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'records'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📜 积分明细
          </button>
        </div>

        {/* 商品列表 */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-2 gap-4">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setShowRedeemModal(true);
                }}
              >
                <div className="text-4xl mb-2 text-center">{item.icon}</div>
                <h4 className="font-heading font-semibold text-gray-800 text-center mb-1">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 text-center mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold text-lg">
                    {item.points}分
                  </span>
                  <span className="text-xs text-gray-500">
                    剩{item.stock}件
                  </span>
                </div>
                <button
                  className="w-full mt-3 btn btn-primary text-sm py-2"
                  disabled={item.stock === 0 || summary.totalPoints < item.points}
                >
                  {item.stock === 0 ? '售罄' : summary.totalPoints < item.points ? '积分不足' : '立即兑换'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 积分明细 */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-2">📝</p>
                  <p>暂无积分记录</p>
                </div>
              ) : (
                records.map((record) => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPointsIcon(record.source)}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{record.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        record.type === 'earn' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {record.type === 'earn' ? '+' : '-'}{Math.abs(record.amount)}分
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 兑换确认弹窗 */}
      {showRedeemModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <span className="text-6xl">{selectedItem.icon}</span>
              <h3 className="text-xl font-heading font-semibold mt-3">{selectedItem.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{selectedItem.description}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">价格</span>
                <span className="text-primary font-bold text-lg">{selectedItem.points}积分</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">有效期</span>
                <span className="text-gray-800">{selectedItem.validityDays}天</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">剩余库存</span>
                <span className="text-gray-800">{selectedItem.stock}件</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 btn btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleRedeem}
                className="flex-1 btn btn-primary"
                disabled={summary.totalPoints < selectedItem.points}
              >
                确认兑换
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 兑换成功弹窗 - 显示券码 */}
      {showCouponModal && redeemedCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">🎉</div>
              <h3 className="text-xl font-heading font-semibold">兑换成功！</h3>
              <p className="text-gray-600 text-sm mt-1">
                已扣除 {redeemedCoupon.points} 积分
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-primary-light to-primary rounded-lg p-4 mb-4 text-white">
              <p className="text-sm mb-1">{redeemedCoupon.itemName}</p>
              <p className="text-2xl font-mono font-bold tracking-wider mb-2">
                {redeemedCoupon.code}
              </p>
              <div className="flex justify-between text-xs text-white/80">
                <span>有效期至：{new Date(redeemedCoupon.expiresAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyCouponCode}
                className="w-full btn btn-secondary"
              >
                📋 复制券码
              </button>
              <button
                onClick={() => setShowCouponModal(false)}
                className="w-full btn btn-ghost"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar activeTab="profile" />
    </div>
  );
}
