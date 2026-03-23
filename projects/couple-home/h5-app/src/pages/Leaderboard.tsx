import { useEffect } from 'react';
import { useChoreStore } from '../store/choreStore';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import LeaderboardDisplay from '../components/LeaderboardDisplay';
import StatsCard from '../components/StatsCard';

export default function Leaderboard() {
  const { leaderboard, userStats, partnerStats, loadLeaderboard, loadStats } =
    useChoreStore();
  const { settings } = useAppStore();

  useEffect(() => {
    loadLeaderboard();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-br from-purple-100 via-pink-50 to-rose-50">
      <Header
        title="排行榜"
        showNotification
        onBack={() => window.history.back()}
      />

      <div className="px-4 py-6 space-y-6">
        {/* 标题区域 */}
        <div className="text-center py-6">
          <h1 className="text-4xl mb-2">🏆</h1>
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-1">
            家务排行榜
          </h2>
          <p className="text-sm text-gray-500">
            📅 本周 {new Date().toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {new Date(
              new Date().setDate(new Date().getDate() + 7)
            ).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {userStats && (
            <StatsCard
              stats={userStats}
              nickname={settings?.nickname || '我'}
              isUser={true}
            />
          )}
          {partnerStats && (
            <StatsCard
              stats={partnerStats}
              nickname={settings?.partnerNickname || 'TA'}
              isUser={false}
            />
          )}
        </div>

        {/* 排行榜 */}
        <div>
          <h3 className="text-lg font-heading font-bold text-gray-800 mb-4">
            🏅 排名
          </h3>
          {leaderboard.length > 0 ? (
            <LeaderboardDisplay
              leaderboard={leaderboard}
              userNickname={settings?.nickname || '我'}
              partnerNickname={settings?.partnerNickname || 'TA'}
            />
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center">
              <span className="text-5xl mb-4 block">🌸</span>
              <p className="text-sm text-gray-500">暂无排行数据</p>
            </div>
          )}
        </div>

        {/* 成就提示 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/50">
          <h3 className="font-heading font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🏅</span> 成就系统
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-gray-700">新手上路</p>
                <p className="text-xs text-gray-500">完成第 1 个家务</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl">🐝</span>
              <div>
                <p className="font-semibold text-gray-700">勤劳小蜜蜂</p>
                <p className="text-xs text-gray-500">连续 7 天完成任务</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm opacity-50">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold text-gray-700">完美主义者</p>
                <p className="text-xs text-gray-500">连续 30 天无逾期</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm opacity-50">
              <span className="text-2xl">🦸</span>
              <div>
                <p className="font-semibold text-gray-700">超级英雄</p>
                <p className="text-xs text-gray-500">单周获得 500 分</p>
              </div>
            </div>
          </div>
        </div>

        {/* 积分商城预告 */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4 border-2 border-pink-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏪</span>
            <div>
              <h3 className="font-heading font-bold text-gray-800">
                积分商城
              </h3>
              <p className="text-xs text-gray-500">敬请期待</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            用积分兑换按摩券、游戏券、免洗碗券等惊喜奖励！
          </p>
        </div>
      </div>

      <TabBar activeTab="fridge" />
    </div>
  );
}
