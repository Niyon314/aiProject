import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import './bills.scss'

// 📝 账单类别配置
const CATEGORIES = [
  { value: 'food', label: '🍔 餐饮', color: '#FF6B81' },
  { value: 'transport', label: '🚗 交通', color: '#1E90FF' },
  { value: 'housing', label: '🏠 居住', color: '#FFA502' },
  { value: 'entertainment', label: '🎬 娱乐', color: '#9B59B6' },
  { value: 'shopping', label: '🛍️ 购物', color: '#E84393' },
  { value: 'medical', label: '💊 医疗', color: '#2ED573' },
  { value: 'education', label: '📚 教育', color: '#3742FA' },
  { value: 'other', label: '📦 其他', color: '#636E72' },
]

// 💕 分摊模式配置
const SPLIT_MODES = [
  { value: 'equal', label: '💕 平均 AA', desc: '每人一半' },
  { value: 'ratio', label: '📊 按比例', desc: '自定义比例' },
  { value: 'custom', label: '✏️ 自定义', desc: '手动输入金额' },
  { value: 'gift', label: '🎁 这次我请', desc: '爱的礼物' },
]

// 💰 情感备注模板
const EMOTIONAL_TEMPLATES = [
  '请你喝的奶茶，因为你今天加班辛苦了 💕',
  '今天你做饭，我来买单 🍳',
  '庆祝我们在一起的第 N 天 🎉',
  '这次我请，下次你来 💕',
  '谢谢你一直陪在我身边 💕',
]

interface Bill {
  id: string
  title: string
  amount: number
  category: string
  description?: string
  emotionalNote?: string
  paidBy: string
  paidByUser: {
    id: string
    username: string
    avatar?: string
  }
  splitMode: string
  billDate: string
  shares: Array<{
    userId: string
    amount: number
    isPaid: boolean
    user: {
      id: string
      username: string
      avatar?: string
    }
  }>
}

interface BillStats {
  totalAmount: number
  count: number
  byCategory: Array<{
    category: string
    categoryName: string
    amount: number
  }>
  user1Total: number
  user2Total: number
  user1Name: string
  user2Name: string
}

export default function Bills() {
  const [currentMonth, setCurrentMonth] = useState<string>('')
  const [bills, setBills] = useState<Bill[]>([])
  const [stats, setStats] = useState<BillStats | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food',
    description: '',
    emotionalNote: '',
    splitMode: 'equal',
    splitRatio: 50,
  })

  useEffect(() => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setCurrentMonth(month)
    fetchBills(month)
    fetchStats(month)
  }, [])

  // 获取账单列表
  const fetchBills = async (month: string) => {
    setLoading(true)
    try {
      // TODO: 替换为实际 API 调用
      // const res = await Taro.request({
      //   url: `${API_BASE}/bills`,
      //   data: { coupleId: COUPLE_ID, month },
      // })
      // setBills(res.data)
      
      // 模拟数据
      setBills([])
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 获取统计数据
  const fetchStats = async (month: string) => {
    try {
      // TODO: 替换为实际 API 调用
      // const res = await Taro.request({
      //   url: `${API_BASE}/bills/statistics/overview`,
      //   data: { coupleId: COUPLE_ID, month },
      // })
      // setStats(res.data)
      
      // 模拟数据
      setStats({
        totalAmount: 0,
        count: 0,
        byCategory: [],
        user1Total: 0,
        user2Total: 0,
        user1Name: '我',
        user2Name: 'TA',
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // 创建账单
  const handleCreateBill = async () => {
    if (!formData.title || !formData.amount) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    try {
      // TODO: 替换为实际 API 调用
      // await Taro.request({
      //   url: `${API_BASE}/bills`,
      //   method: 'POST',
      //   data: {
      //     ...formData,
      //     amount: parseFloat(formData.amount),
      //     splitRatio: formData.splitMode === 'ratio' ? formData.splitRatio / 100 : undefined,
      //     coupleId: COUPLE_ID,
      //     paidById: CURRENT_USER_ID,
      //     paidBy: 'user1',
      //   },
      // })
      
      Taro.showToast({ title: '创建成功 💕', icon: 'success' })
      setShowAddModal(false)
      fetchBills(currentMonth)
      fetchStats(currentMonth)
      
      // 重置表单
      setFormData({
        title: '',
        amount: '',
        category: 'food',
        description: '',
        emotionalNote: '',
        splitMode: 'equal',
        splitRatio: 50,
      })
    } catch (error) {
      Taro.showToast({ title: '创建失败', icon: 'none' })
    }
  }

  // 随机选择情感备注
  const randomEmotionalNote = () => {
    const random = EMOTIONAL_TEMPLATES[Math.floor(Math.random() * EMOTIONAL_TEMPLATES.length)]
    setFormData(prev => ({ ...prev, emotionalNote: random }))
  }

  // 切换月份
  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number)
    const newDate = new Date(year, month - 1 + delta, 1)
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    setCurrentMonth(newMonth)
    fetchBills(newMonth)
    fetchStats(newMonth)
  }

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || '📦'
  }

  // 计算分摊显示
  const renderSplitInfo = (bill: Bill) => {
    if (bill.splitMode === 'gift') {
      return <Text className='split-info gift'>🎁 {bill.paidByUser.username} 请客</Text>
    }
    
    return (
      <View className='split-info'>
        {bill.shares.map((share, idx) => (
          <Text key={idx} className='split-item'>
            {share.user.username}: ¥{share.amount.toFixed(2)}
          </Text>
        ))}
      </View>
    )
  }

  return (
    <View className='bills-page'>
      {/* 🎀 顶部导航 */}
      <View className='header'>
        <View className='header-left'>
          <Text className='month-display'>{currentMonth}</Text>
        </View>
        <Text className='title'>💰 共同账单</Text>
        <View className='header-right'>
          <Button 
            type='primary' 
            size='small'
            onClick={() => setShowStatsModal(true)}
          >
            📊 统计
          </Button>
        </View>
      </View>

      {/* 💕 月份切换 */}
      <View className='month-nav'>
        <Button type='outline' size='small' onClick={() => changeMonth(-1)}>◀ 上月</Button>
        <Text className='current-month'>{currentMonth}</Text>
        <Button type='outline' size='small' onClick={() => changeMonth(1)}>下月 ▶</Button>
      </View>

      {/* 💰 本月总结卡片 */}
      {stats && (
        <Card variant='gradient' className='summary-card'>
          <View className='summary-content'>
            <Text className='summary-emoji'>🏠</Text>
            <Text className='summary-label'>本月我们一起花了</Text>
            <Text className='summary-amount'>¥{stats.totalAmount.toFixed(2)}</Text>
            <Text className='summary-sub'>
              共 {stats.count} 笔支出 · {stats.user1Name} ¥{stats.user1Total.toFixed(2)} · {stats.user2Name} ¥{stats.user2Total.toFixed(2)}
            </Text>
            
            {/* 💕 月度总结语 */}
            {stats.totalAmount > 0 && (
              <Text className='monthly-message'>
                这个月我们一起花了 {stats.totalAmount.toFixed(2)} 元建设小家 💕
              </Text>
            )}
          </View>
        </Card>
      )}

      {/* 📋 账单列表 */}
      <ScrollView scrollY className='bill-list'>
        {bills.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-emoji'>🧾</Text>
            <Text className='empty-tip'>暂无账单记录</Text>
            <Text className='empty-desc'>开始记录你们的共同支出吧</Text>
          </View>
        ) : (
          bills.map(bill => (
            <Card key={bill.id} variant='cute' className='bill-card'>
              <View className='bill-header'>
                <View className='bill-category' style={{ backgroundColor: CATEGORIES.find(c => c.value === bill.category)?.color }}>
                  {getCategoryIcon(bill.category)}
                </View>
                <View className='bill-info'>
                  <Text className='bill-title'>{bill.title}</Text>
                  {bill.emotionalNote && (
                    <Text className='bill-emotional'>💕 {bill.emotionalNote}</Text>
                  )}
                </View>
                <Text className='bill-amount'>¥{bill.amount.toFixed(2)}</Text>
              </View>
              
              <View className='bill-footer'>
                <Text className='bill-date'>📅 {new Date(bill.billDate).toLocaleDateString()}</Text>
                <Text className='bill-payer'>💳 {bill.paidByUser.username} 支付</Text>
              </View>
              
              {renderSplitInfo(bill)}
            </Card>
          ))
        )}
      </ScrollView>

      {/* ✨ 添加按钮 */}
      <Button 
        type='gradient' 
        size='large' 
        className='add-button'
        onClick={() => setShowAddModal(true)}
      >
        ➕ 添加账单
      </Button>

      {/* 📝 添加账单弹窗 */}
      {showAddModal && (
        <View className='modal-overlay'>
          <Card variant='cute' className='add-modal'>
            <View className='modal-header'>
              <Text className='modal-title'>💰 添加账单</Text>
              <Text className='modal-close' onClick={() => setShowAddModal(false)}>✕</Text>
            </View>
            
            <ScrollView scrollY className='modal-content'>
              <View className='form-group'>
                <Text className='form-label'>标题 *</Text>
                <Input
                  placeholder='例如：一起喝的奶茶'
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </View>

              <View className='form-group'>
                <Text className='form-label'>金额 *</Text>
                <Input
                  type='number'
                  placeholder='0.00'
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </View>

              <View className='form-group'>
                <Text className='form-label'>分类</Text>
                <View className='category-grid'>
                  {CATEGORIES.map(cat => (
                    <View
                      key={cat.value}
                      className={`category-item ${formData.category === cat.value ? 'active' : ''}`}
                      style={{ 
                        borderColor: cat.color,
                        backgroundColor: formData.category === cat.value ? cat.color + '20' : 'transparent'
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                    >
                      <Text className='category-emoji'>{cat.label.split(' ')[0]}</Text>
                      <Text className='category-name'>{cat.label.split(' ').slice(1).join(' ')}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className='form-group'>
                <Text className='form-label'>分摊方式</Text>
                <View className='split-mode-list'>
                  {SPLIT_MODES.map(mode => (
                    <View
                      key={mode.value}
                      className={`split-mode-item ${formData.splitMode === mode.value ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, splitMode: mode.value }))}
                    >
                      <Text className='split-mode-label'>{mode.label}</Text>
                      <Text className='split-mode-desc'>{mode.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {formData.splitMode === 'ratio' && (
                <View className='form-group'>
                  <Text className='form-label'>我的分摊比例：{formData.splitRatio}%</Text>
                  <View className='slider-container'>
                    <Text>0%</Text>
                    <input
                      type='range'
                      min='0'
                      max='100'
                      value={formData.splitRatio}
                      onChange={(e) => setFormData(prev => ({ ...prev, splitRatio: parseInt(e.target.value) }))}
                      className='ratio-slider'
                    />
                    <Text>100%</Text>
                  </View>
                </View>
              )}

              <View className='form-group'>
                <View className='form-label-row'>
                  <Text className='form-label'>情感备注</Text>
                  <Text className='random-btn' onClick={randomEmotionalNote}>🎲 随机</Text>
                </View>
                <Input
                  placeholder='请你喝的奶茶，因为你今天加班辛苦了'
                  value={formData.emotionalNote}
                  onChange={(e) => setFormData(prev => ({ ...prev, emotionalNote: e.target.value }))}
                />
              </View>

              <View className='form-group'>
                <Text className='form-label'>描述</Text>
                <Input
                  placeholder='添加更多细节...'
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </View>
            </ScrollView>

            <View className='modal-footer'>
              <Button type='outline' onClick={() => setShowAddModal(false)}>取消</Button>
              <Button type='gradient' onClick={handleCreateBill}>创建账单 💕</Button>
            </View>
          </Card>
        </View>
      )}

      {/* 📊 统计弹窗 */}
      {showStatsModal && stats && (
        <View className='modal-overlay'>
          <Card variant='cute' className='stats-modal'>
            <View className='modal-header'>
              <Text className='modal-title'>📊 支出统计</Text>
              <Text className='modal-close' onClick={() => setShowStatsModal(false)}>✕</Text>
            </View>
            
            <ScrollView scrollY className='modal-content'>
              <View className='stats-summary'>
                <Text className='stats-total'>总支出：¥{stats.totalAmount.toFixed(2)}</Text>
                <Text className='stats-count'>共 {stats.count} 笔</Text>
              </View>

              <View className='category-stats'>
                <Text className='stats-subtitle'>🏷️ 按分类</Text>
                {stats.byCategory.map((cat, idx) => (
                  <View key={idx} className='stat-row'>
                    <Text className='stat-label'>{cat.categoryName}</Text>
                    <View className='stat-bar-container'>
                      <View 
                        className='stat-bar' 
                        style={{ 
                          width: `${stats.totalAmount > 0 ? (cat.amount / stats.totalAmount * 100) : 0}%`,
                          backgroundColor: CATEGORIES.find(c => c.value === cat.category)?.color 
                        }}
                      />
                    </View>
                    <Text className='stat-value'>¥{cat.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              <View className='settlement-section'>
                <Text className='stats-subtitle'>💕 爱的账户</Text>
                <View className='settlement-info'>
                  <Text>{stats.user1Name}: ¥{stats.user1Total.toFixed(2)}</Text>
                  <Text>{stats.user2Name}: ¥{stats.user2Total.toFixed(2)}</Text>
                </View>
                {Math.abs(stats.user1Total - stats.user2Total) > 0 && (
                  <Text className='settlement-message'>
                    透明但不计较，爱才是最重要的 💕
                  </Text>
                )}
              </View>
            </ScrollView>
          </Card>
        </View>
      )}
    </View>
  )
}
