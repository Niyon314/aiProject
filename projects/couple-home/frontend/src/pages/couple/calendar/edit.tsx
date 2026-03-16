import { useState, useEffect } from 'react'
import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './edit.scss'

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
}

type EventType = 'work' | 'date' | 'travel' | 'shopping' | 'entertainment' | 'other'

export default function EditCalendar() {
  const router = useRouter()
  const { id } = router.params
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [type, setType] = useState<EventType>('other')
  const [isAllDay, setIsAllDay] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState('')
  const [reminder, setReminder] = useState(true)
  const [reminderTime, setReminderTime] = useState('')

  // 加载日程详情
  useEffect(() => {
    if (!id) return

    const loadEvent = async () => {
      setLoading(true)
      try {
        const res = await Taro.request({
          url: `/api/calendar/${id}`,
        })

        if (res.statusCode === 200) {
          const data = res.data as CalendarEvent
          setEvent(data)
          
          // 填充表单
          setTitle(data.title)
          setDescription(data.description || '')
          
          const start = new Date(data.startTime)
          const end = new Date(data.endTime)
          
          setStartDate(formatDateForInput(start))
          setStartTime(formatTimeForInput(start))
          setEndDate(formatDateForInput(end))
          setEndTime(formatTimeForInput(end))
          
          setType(data.type as EventType)
          setIsAllDay(data.isAllDay)
          setIsRecurring(data.isRecurring)
          setRecurrence(data.recurrence || '')
          setReminder(data.reminder)
          
          if (data.reminderTime) {
            setReminderTime(formatTimeForInput(new Date(data.reminderTime)))
          }
        }
      } catch (error) {
        console.error('加载日程失败:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  // 格式化日期为 input 需要的格式
  function formatDateForInput(date: Date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 格式化时间为 input 需要的格式
  function formatTimeForInput(date: Date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 格式化日期时间为 ISO 字符串
  function formatDateTime(dateStr: string, timeStr: string) {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString()
  }

  // 保存修改
  const handleSave = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请填写日程标题', icon: 'none' })
      return
    }

    setSaving(true)
    try {
      const res = await Taro.request({
        url: `/api/calendar/${id}`,
        method: 'PATCH',
        data: {
          title: title.trim(),
          description: description.trim(),
          startTime: formatDateTime(startDate, isAllDay ? '00:00' : startTime),
          endTime: formatDateTime(endDate, isAllDay ? '23:59' : endTime),
          type,
          isAllDay,
          isRecurring,
          recurrence: isRecurring ? recurrence : null,
          reminder,
          reminderTime: reminder && reminderTime ? formatDateTime(startDate, reminderTime) : null,
        },
      })

      if (res.statusCode === 200) {
        Taro.showToast({ title: '保存成功 💕', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
      }
    } catch (error) {
      console.error('保存日程失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  // 删除日程
  const handleDelete = async () => {
    const confirm = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个日程吗？',
      confirmText: '删除',
      confirmColor: '#FF4757',
    })

    if (confirm.confirm) {
      try {
        const res = await Taro.request({
          url: `/api/calendar/${id}`,
          method: 'DELETE',
        })

        if (res.statusCode === 200) {
          Taro.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        }
      } catch (error) {
        console.error('删除日程失败:', error)
        Taro.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  }

  const typeOptions = [
    { value: 'work', label: '💼 工作' },
    { value: 'date', label: '💕 约会' },
    { value: 'travel', label: '✈️ 旅行' },
    { value: 'shopping', label: '🛍️ 购物' },
    { value: 'entertainment', label: '🎉 娱乐' },
    { value: 'other', label: '📝 其他' },
  ]

  const recurrenceOptions = [
    { value: 'daily', label: '每天' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'yearly', label: '每年' },
  ]

  if (loading) {
    return (
      <View className='edit-page'>
        <View className='loading-tip'>加载中... 💕</View>
      </View>
    )
  }

  return (
    <View className='edit-page'>
      <View className='edit-header'>
        <Text className='edit-title'>✏️ 编辑日程</Text>
        <Button className='delete-btn' onClick={handleDelete}>
          🗑️ 删除
        </Button>
      </View>

      <ScrollView scrollY className='edit-body'>
        {/* 标题 */}
        <View className='form-group'>
          <Text className='form-label'>标题 *</Text>
          <Input
            className='form-input'
            value={title}
            onChange={(e) => setTitle(e.detail.value)}
            placeholder='输入日程标题...'
            maxLength={50}
          />
        </View>

        {/* 描述 */}
        <View className='form-group'>
          <Text className='form-label'>描述</Text>
          <Textarea
            className='form-input form-textarea'
            value={description}
            onChange={(e) => setDescription(e.detail.value)}
            placeholder='添加详细描述...'
            maxLength={200}
          />
        </View>

        {/* 日期时间 */}
        <View className='form-group'>
          <Text className='form-label'>开始时间</Text>
          <View className='datetime-row'>
            <Input
              className='form-input datetime-input'
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.detail.value)}
            />
            {!isAllDay && (
              <Input
                className='form-input datetime-input'
                type='time'
                value={startTime}
                onChange={(e) => setStartTime(e.detail.value)}
              />
            )}
          </View>
        </View>

        <View className='form-group'>
          <Text className='form-label'>结束时间</Text>
          <View className='datetime-row'>
            <Input
              className='form-input datetime-input'
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.detail.value)}
            />
            {!isAllDay && (
              <Input
                className='form-input datetime-input'
                type='time'
                value={endTime}
                onChange={(e) => setEndTime(e.detail.value)}
              />
            )}
          </View>
        </View>

        {/* 全天事件 */}
        <View className='form-group'>
          <View className='checkbox-row'>
            <Input
              className='checkbox'
              type='checkbox'
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.detail.checked)}
            />
            <Text>全天事件</Text>
          </View>
        </View>

        {/* 类型选择 */}
        <View className='form-group'>
          <Text className='form-label'>类型</Text>
          <View className='radio-group'>
            {typeOptions.map((option) => (
              <View
                key={option.value}
                className={`radio-option ${type === option.value ? 'selected' : ''}`}
                onClick={() => setType(option.value as EventType)}
              >
                {option.label}
              </View>
            ))}
          </View>
        </View>

        {/* 重复设置 */}
        <View className='form-group'>
          <View className='checkbox-row'>
            <Input
              className='checkbox'
              type='checkbox'
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.detail.checked)}
            />
            <Text>重复日程</Text>
          </View>
          {isRecurring && (
            <View className='radio-group' style={{ marginTop: '12px' }}>
              {recurrenceOptions.map((option) => (
                <View
                  key={option.value}
                  className={`radio-option ${recurrence === option.value ? 'selected' : ''}`}
                  onClick={() => setRecurrence(option.value)}
                >
                  {option.label}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 提醒设置 */}
        <View className='form-group'>
          <View className='checkbox-row'>
            <Input
              className='checkbox'
              type='checkbox'
              checked={reminder}
              onChange={(e) => setReminder(e.detail.checked)}
            />
            <Text>设置提醒</Text>
          </View>
          {reminder && (
            <Input
              className='form-input'
              type='time'
              value={reminderTime}
              onChange={(e) => setReminderTime(e.detail.value)}
              style={{ marginTop: '12px' }}
            />
          )}
        </View>
      </ScrollView>

      <Button className='save-btn' onClick={handleSave} disabled={saving}>
        {saving ? '保存中...' : '保存修改 💕'}
      </Button>
    </View>
  )
}
