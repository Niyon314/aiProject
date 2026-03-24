import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import { statisticsApi } from '../api/statisticsApi';
import type {
  SpendingTrendItem,
  CategoryItem,
  ChoreContributionItem,
  OverviewData,
} from '../api/statisticsApi';

export default function Statistics() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrendItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [choresContribution, setChoresContribution] = useState<
    ChoreContributionItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    loadStatistics();
  }, [selectedMonth]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [overviewData, trendData, categoriesData, choresData] =
        await Promise.all([
          statisticsApi.getOverview(),
          statisticsApi.getSpendingTrend(30),
          statisticsApi.getCategories(selectedMonth),
          statisticsApi.getChoresContribution(30),
        ]);
      setOverview(overviewData);
      setSpendingTrend(trendData);
      setCategories(categoriesData);
      setChoresContribution(choresData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
      <Header
        title="数据报表"
        showNotification={false}
        onBack={() => window.history.back()}
      />

      <div className="px-4 py-6 space-y-6">
        {/* 月份选择器 */}
        <div className="flex justify-end">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 bg-white rounded-lg border border-pink-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = date.toISOString().slice(0, 7);
              const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* 总览卡片 */}
        {overview && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100">
              <div className="text-gray-500 text-sm mb-1">💰 总支出</div>
              <div className="text-2xl font-bold text-gray-800">
                {formatAmount(overview.totalSpending)}
              </div>
              <div className="text-xs text-green-500 mt-1">↓ 12%</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100">
              <div className="text-gray-500 text-sm mb-1">🧹 总积分</div>
              <div className="text-2xl font-bold text-gray-800">
                {overview.totalPoints} 分
              </div>
              <div className="text-xs text-green-500 mt-1">↑ 25%</div>
            </div>
          </div>
        )}

        {/* 消费趋势 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📈 消费趋势
          </h3>
          <div className="h-64">
            {spendingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#999"
                    fontSize={12}
                  />
                  <YAxis stroke="#999" fontSize={12} />
                  <Tooltip
                    formatter={(value: any) => formatAmount(Number(value))}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #FFB5C5',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#FF6B81"
                    strokeWidth={2}
                    dot={{ fill: '#FF6B81', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        {/* 消费分类 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🥧 消费分类
          </h3>
          <div className="h-64">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatAmount(Number(value))}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #FFB5C5',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        {/* 家务贡献 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🧹 家务贡献
          </h3>
          <div className="space-y-4">
            {choresContribution.map((item) => (
              <div key={item.user} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {item.user === '我' ? '👤 我' : '👤 TA'}
                  </span>
                  <span className="text-gray-600">
                    {item.completed} 项 ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.user === '我'
                        ? 'bg-gradient-to-r from-pink-400 to-pink-500'
                        : 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar activeTab="stats" />
    </div>
  );
}
