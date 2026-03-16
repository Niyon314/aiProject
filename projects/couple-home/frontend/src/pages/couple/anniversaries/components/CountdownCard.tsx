import { View, Text } from '@tarojs/components'
import Card from '../../../../components/Card'
import './CountdownCard.scss'

interface Anniversary {
  id: string
  title: string
  date: string
  type: string
  description?: string
  isRecurring: boolean
  enableReminder: boolean
  reminderDays: number[]
  countdown?: {
    days: number
    nextDate: string
    isToday: boolean
    message: string
  }
}

interface CountdownCardProps {
  anniversary: Anniversary
  emoji: string
  label: string
  onEdit: () => void
  onDelete: () => void
}

export default function CountdownCard({
  anniversary,
  emoji,
  label,
  onEdit,
  onDelete,
}: CountdownCardProps) {
  const countdown = anniversary.countdown
  const isToday = countdown?.isToday ?? false
  const days = countdown?.days ?? 0

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month}月${day}日 (${year}年)`
  }

  // 获取提醒状态文本
  const getReminderText = () => {
    if (!anniversary.enableReminder) {
      return '🔕 提醒关闭'
    }
    const days = anniversary.reminderDays || []
    if (days.length === 0) {
      return '🔕 无提醒'
    }
    const dayTexts = days.map(d => {
      if (d === 0) return '当天'
      if (d === 1) return '1 天'
      return `${d}天`
    })
    return `🔔 提前 ${dayTexts.join('/')}`
  }

  return (
    <Card variant='cute' padding='medium' shadow='soft' className='countdown-card'>
      {/* 顶部装饰 */}
      <View className='card-top'>
        <View className='card-emoji'>{emoji}</View>
        <View className='card-type'>{label}</View>
      </View>

      {/* 纪念日标题 */}
      <View className='card-title'>{anniversary.title}</View>

      {/* 倒计时 */}
      <View className={`countdown-display ${isToday ? 'today' : ''}`}>
        {isToday ? (
          <>
            <Text className='countdown-emoji'>🎉</Text>
            <Text className='countdown-text'>就是今天!</Text>
          </>
        ) : (
          <>
            <Text className='countdown-number'>{days}</Text>
            <Text className='countdown-unit'>天</Text>
          </>
        )}
      </View>

      {/* 倒计时消息 */}
      {countdown?.message && !isToday && (
        <View className='countdown-message'>{countdown.message}</View>
      )}

      {/* 日期信息 */}
      <View className='card-date'>
        <Text className='date-label'>📅 {anniversary.isRecurring ? '每年' : '一次'} </Text>
        <Text className='date-value'>{formatDate(anniversary.date)}</Text>
      </View>

      {/* 描述 */}
      {anniversary.description && (
        <View className='card-description'>{anniversary.description}</View>
      )}

      {/* 提醒设置 */}
      <View className='card-reminder'>{getReminderText()}</View>

      {/* 操作按钮 */}
      <View className='card-actions'>
        <View className='action-btn edit' onClick={onEdit}>
          <Text>✏️ 编辑</Text>
        </View>
        <View className='action-btn delete' onClick={onDelete}>
          <Text>🗑️ 删除</Text>
        </View>
      </View>
    </Card>
  )
}
