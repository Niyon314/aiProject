import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import Chart, { createCategoryChartData } from '../../../components/Chart'
import './settlement.scss'

interface SettlementData {
  year: number
  month: number
  totalAmount: number
  billCount: number
  user1: {
    id: string
    name: string
    totalPaid: number
  }
  user2: {
    id: string
    name: string
    totalPaid: number
  }
  settlement: {
    difference: number
    payer: { id: string; name: string } | null
    receiver: { id: string; name: string } | null
    message: string
  }
  byCategory: Array<{
    category: string
    categoryName: string
    amount: number
  }>
  summary: string
  bills: any[]
}

export default function Settlement() {
  const [currentMonth, setCurrentMonth] = useState<{ year: number; month: number }>({ 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 
  })
  const [settlement, setSettlement] = useState<SettlementData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettlement(currentMonth.year, currentMonth.month)
  }, [currentMonth])

  const fetchSettlement = async (year: number, month: number) => {
    setLoading(true)
    try {
      // TODO: 替换为实际 API 调用
      // const res = await Taro.request({
      //   url: `${API_BASE}/bills/settlement/monthly`,
      //   data: { 
      //     coupleId: COUPLE_ID, 
      //     year, 
      //     month 
      //   },
      // })
      // setSettlement(res.data)
      
      // 模拟数据
      setSettlement(null)
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth.month + delta
    let newYear = currentMonth.year
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    setCurrentMonth({ year: newYear, month: newMonth })
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  if (!settlement) {
    return (
      <View className='settlement-page'>
        <View className='header'>
          <Text className='title'>📅 月度结算</Text>
        </View>
        
        <View className='empty-state'>
          <Text className='empty-emoji'>🧾</Text>
          <Text className='empty-tip'>本月暂无账单</Text>
          <Text className='empty-desc'>开始记录你们的共同支出吧</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='settlement-page'>
      {/* 🎀 顶部导航 */}
      <View className='header'>
        <Button type='outline' size='small' onClick={() => changeMonth(-1)}>◀ 上月</Button>
        <Text className='month-title'>{currentMonth.year}年{monthNames[currentMonth.month - 1]}</Text>
        <Button type='outline' size='small' onClick={() => changeMonth(1)}>下月 ▶</Button>
      </View>

      <ScrollView scrollY className='settlement-content'>
        {/* 💕 月度总结卡片 */}
        <Card variant='gradient' className='summary-card'>
          <View className='summary-content'>
            <Text className='summary-emoji'>🏠</Text>
            <Text className='summary-label'>{monthNames[currentMonth.month - 1]}我们一起花了</Text>
            <Text className='summary-amount'>¥{settlement.totalAmount.toFixed(2)}</Text>
            <Text className='summary-count'>共 {settlement.billCount} 笔支出</Text>
            <Text className='summary-message'>💕 {settlement.summary}</Text>
          </View>
        </Card>

        {/* 💰 结算信息 */}
        <Card variant='cute' className='settlement-card'>
          <View className='card-header'>
            <Text className='card-title'>💰 爱的结算</Text>
          </View>
          
          <View className='settlement-info'>
            <View className='user-stat'>
              <Text className='user-name'>{settlement.user1.name}</Text>
              <Text className='user-amount'>¥{settlement.user1.totalPaid.toFixed(2)}</Text>
            </View>
            
            <View className='vs-divider'>
              <Text className='vs-text'>VS</Text>
            </View>
            
            <View className='user-stat'>
              <Text className='user-name'>{settlement.user2.name}</Text>
              <Text className='user-amount'>¥{settlement.user2.totalPaid.toFixed(2)}</Text>
            </View>
          </View>

          {settlement.settlement.difference > 0 ? (
            <View className='settlement-result'>
              <Text className='result-emoji'>💕</Text>
              <Text className='result-message'>{settlement.settlement.message}</Text>
              <Text className='result-tip'>透明但不计较，爱才是最重要的</Text>
            </View>
          ) : (
            <View className='settlement-result balanced'>
              <Text className='result-emoji'>💕</Text>
              <Text className='result-message'>本月已完美平衡！</Text>
              <Text className='result-tip'>这就是爱的默契</Text>
            </View>
          )}
        </Card>

        {/* 📊 分类统计图表 */}
        {settlement.byCategory.length > 0 && (
          <Card variant='cute' className='stats-card'>
            <View className='card-header'>
              <Text className='card-title'>📊 支出分类</Text>
            </View>
            
            <Chart
              type='donut'
              data={createCategoryChartData(settlement.byCategory)}
              showValues
              showPercentage
              height={350}
            />
          </Card>
        )}

        {/* 📋 账单明细 */}
        {settlement.bills.length > 0 && (
          <Card variant='cute' className='bills-card'>
            <View className='card-header'>
              <Text className='card-title'>📋 账单明细</Text>
              <Text className='card-subtitle'>{settlement.bills.length} 笔</Text>
            </View>
            
            <View className='bills-list'>
              {settlement.bills.map((bill: any) => (
                <View key={bill.id} className='bill-item'>
                  <View className='bill-date'>
                    <Text>{new Date(bill.billDate).toLocaleDateString()}</Text>
                  </View>
                  <View className='bill-info'>
                    <Text className='bill-title'>{bill.title}</Text>
                    {bill.emotionalNote && (
                      <Text className='bill-note'>💕 {bill.emotionalNote}</Text>
                    )}
                  </View>
                  <Text className='bill-amount'>¥{bill.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* 💡 温馨提示 */}
        <Card variant='transparent' className='tip-card'>
          <Text className='tip-emoji'>💡</Text>
          <Text className='tip-text'>
            AA 制不是为了计较，而是为了让彼此都感受到公平和尊重。
            重要的是我们一起建设小家的过程 💕
          </Text>
        </Card>
      </ScrollView>
    </View>
  )
}
