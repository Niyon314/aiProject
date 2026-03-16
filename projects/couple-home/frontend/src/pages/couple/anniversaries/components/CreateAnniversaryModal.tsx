import { useState } from 'react'
import { View, Text, Input, Picker, Switch, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Card from '../../../../components/Card'
import './CreateAnniversaryModal.scss'

interface CreateAnniversaryModalProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

const anniversaryTypes = [
  { value: 'first_date', label: '💕 在一起', emoji: '💕' },
  { value: 'birthday', label: '🎂 生日', emoji: '🎂' },
  { value: 'engagement', label: '💍 订婚', emoji: '💍' },
  { value: 'wedding', label: '💒 结婚', emoji: '💒' },
  { value: 'other', label: '🎉 其他', emoji: '🎉' },
]

const reminderDayOptions = [
  { value: 7, label: '7 天' },
  { value: 3, label: '3 天' },
  { value: 1, label: '1 天' },
  { value: 0, label: '当天' },
]

export default function CreateAnniversaryModal({
  onClose,
  onSubmit,
}: CreateAnniversaryModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('first_date')
  const [description, setDescription] = useState('')
  const [isRecurring, setIsRecurring] = useState(true)
  const [enableReminder, setEnableReminder] = useState(true)
  const [reminderDays, setReminderDays] = useState<number[]>([7, 3, 1, 0])

  // 格式化日期选择器显示
  const formatDateForPicker = (dateStr: string) => {
    if (!dateStr) return '选择日期'
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  // 处理类型选择
  const handleTypeChange = (e: any) => {
    setType(e.detail.value)
  }

  // 处理日期选择
  const handleDateChange = (e: any) => {
    setDate(e.detail.value)
  }

  // 切换提醒选项
  const toggleReminderDay = (day: number) => {
    if (!enableReminder) return
    
    if (reminderDays.includes(day)) {
      const newDays = reminderDays.filter(d => d !== day)
      setReminderDays(newDays.length > 0 ? newDays : [7])
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a))
    }
  }

  // 提交表单
  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入纪念日名称', icon: 'none' })
      return
    }

    if (!date) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    onSubmit({
      title: title.trim(),
      date,
      type,
      description: description.trim(),
      isRecurring,
      enableReminder,
      reminderDays,
    })
  }

  return (
    <View className='modal-overlay' onClick={onClose}>
      <View className='modal-content' onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <View className='modal-header'>
          <Text className='modal-title'>💕 添加纪念日</Text>
          <Text className='modal-close' onClick={onClose}>✕</Text>
        </View>

        {/* 表单内容 */}
        <ScrollView className='modal-body' scrollY>
          {/* 纪念日名称 */}
          <View className='form-group'>
            <Text className='form-label'>纪念日名称</Text>
            <Input
              className='form-input'
              placeholder='例如：我们的第一个纪念日'
              value={title}
              onInput={e => setTitle(e.detail.value)}
            />
          </View>

          {/* 日期选择 */}
          <View className='form-group'>
            <Text className='form-label'>纪念日日期</Text>
            <Picker
              mode='date'
              value={date}
              onChange={handleDateChange}
            >
              <View className='form-picker'>
                <Text className={date ? 'picker-value' : 'picker-placeholder'}>
                  {formatDateForPicker(date)}
                </Text>
                <Text className='picker-arrow'>📅</Text>
              </View>
            </Picker>
          </View>

          {/* 类型选择 */}
          <View className='form-group'>
            <Text className='form-label'>纪念日类型</Text>
            <Picker
              mode='selector'
              range={anniversaryTypes}
              rangeKey='label'
              value={anniversaryTypes.findIndex(t => t.value === type)}
              onChange={handleTypeChange}
            >
              <View className='form-picker'>
                <Text className='picker-value'>
                  {anniversaryTypes.find(t => t.value === type)?.label}
                </Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
          </View>

          {/* 描述 */}
          <View className='form-group'>
            <Text className='form-label'>描述 (可选)</Text>
            <Input
              className='form-input'
              placeholder='添加一些特别的备注~'
              value={description}
              onInput={e => setDescription(e.detail.value)}
            />
          </View>

          {/* 是否重复 */}
          <View className='form-group form-row'>
            <Text className='form-label'>每年重复</Text>
            <Switch
              checked={isRecurring}
              onChange={e => setIsRecurring(e.detail.value)}
              color='#FF6B81'
            />
          </View>

          {/* 启用提醒 */}
          <View className='form-group form-row'>
            <Text className='form-label'>启用提醒</Text>
            <Switch
              checked={enableReminder}
              onChange={e => setEnableReminder(e.detail.value)}
              color='#FF6B81'
            />
          </View>

          {/* 提醒设置 */}
          {enableReminder && (
            <View className='form-group'>
              <Text className='form-label'>提前提醒</Text>
              <View className='reminder-options'>
                {reminderDayOptions.map(option => (
                  <View
                    key={option.value}
                    className={`reminder-tag ${reminderDays.includes(option.value) ? 'active' : ''}`}
                    onClick={() => toggleReminderDay(option.value)}
                  >
                    {option.label}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 底部按钮 */}
        <View className='modal-footer'>
          <Button className='btn-cancel' onClick={onClose}>
            取消
          </Button>
          <Button className='btn-submit' onClick={handleSubmit}>
            创建 💕
          </Button>
        </View>
      </View>
    </View>
  )
}
