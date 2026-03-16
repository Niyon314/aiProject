import { useState } from 'react'
import { View, Text, Button, Input, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './CreateEventModal.scss'

interface CreateEventModalProps {
  onClose: () => void
  onSubmit: (eventData: any) => void
  currentDate: Date
}

type EventType = 'work' | 'date' | 'travel' | 'shopping' | 'entertainment' | 'other'

export default function CreateEventModal({ onClose, onSubmit, currentDate }: CreateEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(formatDateForInput(currentDate))
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(formatDateForInput(currentDate))
  const [endTime, setEndTime] = useState('10:00')
  const [type, setType] = useState<EventType>('other')
  const [isAllDay, setIsAllDay] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState('')
  const [reminder, setReminder] = useState(true)
  const [reminderTime, setReminderTime] = useState('')

  // 格式化日期为 input 需要的格式
  function formatDateForInput(date: Date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 格式化日期时间为 ISO 字符串
  function formatDateTime(dateStr: string, timeStr: string) {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString()
  }

  // 提交表单
  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请填写日程标题', icon: 'none' })
      return
    }

    const eventData = {
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
    }

    onSubmit(eventData)
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

  return (
    <View className='modal-overlay' onClick={onClose}>
      <View className='modal-content' onClick={(e) => e.stopPropagation()}>
        <View className='modal-header'>
          <Text className='modal-title'>📅 创建日程</Text>
          <Button className='close-btn' onClick={onClose}>✕</Button>
        </View>

        <ScrollView scrollY className='modal-body'>
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

        <Button className='submit-btn' onClick={handleSubmit}>
          创建日程 💕
        </Button>
      </View>
    </View>
  )
}
