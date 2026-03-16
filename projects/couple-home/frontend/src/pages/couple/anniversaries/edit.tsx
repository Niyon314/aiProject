import { useState, useEffect } from 'react'
import { View, Text, Input, Picker, Switch, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './edit.scss'

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

export default function EditAnniversary() {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('first_date')
  const [description, setDescription] = useState('')
  const [isRecurring, setIsRecurring] = useState(true)
  const [enableReminder, setEnableReminder] = useState(true)
  const [reminderDays, setReminderDays] = useState<number[]>([7, 3, 1, 0])

  const id = Taro.getCurrentInstance().router?.params.id

  // 加载纪念日详情
  useEffect(() => {
    if (!id) return

    const loadAnniversary = async () => {
      setLoading(true)
      try {
        const res = await Taro.request({
          url: `/api/anniversaries/${id}`,
        })

        if (res.statusCode === 200) {
          const data = res.data
          setTitle(data.title)
          setDate(data.date.split('T')[0])
          setType(data.type)
          setDescription(data.description || '')
          setIsRecurring(data.isRecurring ?? true)
          setEnableReminder(data.enableReminder ?? true)
          setReminderDays(data.reminderDays || [7, 3, 1, 0])
        }
      } catch (error) {
        console.error('加载纪念日失败:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }

    loadAnniversary()
  }, [id])

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

  // 保存修改
  const handleSave = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入纪念日名称', icon: 'none' })
      return
    }

    if (!date) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    try {
      const res = await Taro.request({
        url: `/api/anniversaries/${id}`,
        method: 'PATCH',
        data: {
          title: title.trim(),
          date,
          type,
          description: description.trim(),
          isRecurring,
          enableReminder,
          reminderDays,
        },
      })

      if (res.statusCode === 200) {
        Taro.showToast({ title: '保存成功 💕', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
      }
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  // 删除纪念日
  const handleDelete = async () => {
    try {
      const res = await Taro.showModal({
        title: '确认删除',
        content: '确定要删除这个纪念日吗？此操作不可恢复。',
        confirmColor: '#FF6B81',
      })

      if (res.confirm) {
        const deleteRes = await Taro.request({
          url: `/api/anniversaries/${id}`,
          method: 'DELETE',
        })

        if (deleteRes.statusCode === 200) {
          Taro.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        }
      }
    } catch (error) {
      console.error('删除失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className='edit-page'>
        <View className='loading-tip'>加载中... 💕</View>
      </View>
    )
  }

  return (
    <View className='edit-page'>
      {/* 头部 */}
      <View className='page-header'>
        <Text className='page-title'>✏️ 编辑纪念日</Text>
      </View>

      {/* 表单 */}
      <ScrollView className='form-container' scrollY>
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
                {date ? `${new Date(date).getFullYear()}年${new Date(date).getMonth() + 1}月${new Date(date).getDate()}日` : '选择日期'}
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

        {/* 删除按钮 */}
        <View className='delete-section'>
          <Button className='btn-delete' onClick={handleDelete}>
            🗑️ 删除纪念日
          </Button>
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View className='footer-actions'>
        <Button className='btn-save' onClick={handleSave}>
          保存修改 💕
        </Button>
      </View>
    </View>
  )
}
