import { View, Text, Button } from '@tarojs/components'
import './EventCard.scss'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: string
  isAllDay: boolean
  reminder: boolean
  reminderTime?: string
  user?: {
    username: string
    avatar?: string
  }
}

interface EventCardProps {
  event: CalendarEvent
  emoji: string
  onEdit: () => void
  onDelete: () => void
}

export default function EventCard({ event, emoji, onEdit, onDelete }: EventCardProps) {
  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
    return `${month}/${day} ${weekday}`
  }

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      work: '工作',
      date: '约会',
      travel: '旅行',
      shopping: '购物',
      entertainment: '娱乐',
      other: '其他',
    }
    return labels[type] || '其他'
  }

  return (
    <View className='event-card'>
      <View className='event-header'>
        <Text className='event-title'>
          {emoji} {event.title}
        </Text>
        <View className='event-actions'>
          <Button className='action-btn' onClick={onEdit}>
            ✏️
          </Button>
          <Button className='action-btn' onClick={onDelete}>
            🗑️
          </Button>
        </View>
      </View>

      <View className='event-time'>
        <Text>🕐 </Text>
        {event.isAllDay ? (
          <Text>全天</Text>
        ) : (
          <Text>
            {formatDate(event.startTime)} {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </Text>
        )}
      </View>

      {event.description && (
        <Text className='event-description'>{event.description}</Text>
      )}

      <View className='event-footer'>
        <Text className='event-type'>{getTypeLabel(event.type)}</Text>
        {event.reminder && (
          <Text className='reminder-badge'>
            🔔 已设置提醒
          </Text>
        )}
      </View>
    </View>
  )
}
