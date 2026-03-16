import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '../../styles/theme'
import CreateEventModal from './components/CreateEventModal'
import EventCard from './components/EventCard'
import CalendarHeader from './components/CalendarHeader'
import './calendar.scss'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: string
  isAllDay: boolean
  isRecurring: boolean
  recurrence?: string
  reminder: boolean
  reminderTime?: string
  userId: string
  coupleId?: string
  user?: {
    username: string
    avatar?: string
  }
}

type ViewMode = 'day' | 'week' | 'month'

export default function Calendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const coupleId = Taro.getStorageSync('coupleId') || ''

  // 加载日程
  const loadEvents = async () => {
    if (!coupleId) return
    
    setLoading(true)
    try {
      let url = `/api/calendar?coupleId=${coupleId}`
      
      if (viewMode === 'day') {
        const start = new Date(currentDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        url += `&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      } else if (viewMode === 'week') {
        const dayOfWeek = currentDate.getDay()
        const start = new Date(currentDate)
        start.setDate(currentDate.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)
        url += `&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      } else if (viewMode === 'month') {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        url += `&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      }

      const res = await Taro.request({ url })
      if (res.statusCode === 200) {
        setEvents(res.data as CalendarEvent[])
      }
    } catch (error) {
      console.error('加载日程失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [currentDate, viewMode, coupleId])

  // 创建日程
  const handleCreateEvent = async (eventData: any) => {
    try {
      const res = await Taro.request({
        url: '/api/calendar',
        method: 'POST',
        data: {
          ...eventData,
          coupleId,
          userId: Taro.getStorageSync('userId'),
        },
      })

      if (res.statusCode === 201) {
        Taro.showToast({ title: '创建成功 💕', icon: 'success' })
        setShowCreateModal(false)
        loadEvents()
      }
    } catch (error) {
      console.error('创建日程失败:', error)
      Taro.showToast({ title: '创建失败', icon: 'none' })
    }
  }

  // 删除日程
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await Taro.request({
        url: `/api/calendar/${eventId}`,
        method: 'DELETE',
      })

      if (res.statusCode === 200) {
        Taro.showToast({ title: '删除成功', icon: 'success' })
        loadEvents()
      }
    } catch (error) {
      console.error('删除日程失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  // 导航到编辑页面
  const handleEditEvent = (event: CalendarEvent) => {
    Taro.navigateTo({
      url: `/pages/couple/calendar/edit?id=${event.id}`,
    })
  }

  // 格式化日期显示
  const formatDateDisplay = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const day = currentDate.getDate()

    if (viewMode === 'day') {
      return `${year}年${month}月${day}日`
    } else if (viewMode === 'week') {
      return `${year}年${month}月 第${Math.ceil(day / 7)}周`
    } else {
      return `${year}年${month}月`
    }
  }

  // 按类型获取 emoji
  const getTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      work: '💼',
      date: '💕',
      travel: '✈️',
      shopping: '🛍️',
      entertainment: '🎉',
      other: '📝',
    }
    return emojiMap[type] || '📅'
  }

  return (
    <View className='calendar-page'>
      {/* 头部 */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
        formatDateDisplay={formatDateDisplay}
      />

      {/* 日程列表 */}
      <ScrollView className='calendar-list' scrollY>
        {loading ? (
          <View className='loading-tip'>加载中... 💕</View>
        ) : events.length === 0 ? (
          <View className='empty-tip'>
            <Text className='empty-emoji'>📅</Text>
            <Text>暂无日程安排</Text>
            <Text className='empty-sub'>点击右下角添加日程吧~</Text>
          </View>
        ) : (
          <View className='events-container'>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                emoji={getTypeEmoji(event.type)}
                onEdit={() => handleEditEvent(event)}
                onDelete={() => handleDeleteEvent(event.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 创建按钮 */}
      <Button
        className='create-button'
        onClick={() => setShowCreateModal(true)}
      >
        <Text className='button-text'>+ 添加日程</Text>
      </Button>

      {/* 创建日程弹窗 */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
          currentDate={currentDate}
        />
      )}
    </View>
  )
}
