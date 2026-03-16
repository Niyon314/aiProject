import { View, Text, Button } from '@tarojs/components'
import './CalendarHeader.scss'

interface CalendarHeaderProps {
  currentDate: Date
  viewMode: 'day' | 'week' | 'month'
  onDateChange: (date: Date) => void
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void
  formatDateDisplay: () => string
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
  formatDateDisplay,
}: CalendarHeaderProps) {
  // 前一天
  const handlePrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    onDateChange(newDate)
  }

  // 后一天
  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onDateChange(newDate)
  }

  // 回到今天
  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <View className='calendar-header'>
      <View className='header-top'>
        <View className='nav-buttons'>
          <Button className='nav-btn' onClick={handlePrev}>
            ←
          </Button>
          <Button className='nav-btn' onClick={handleToday}>
            📅
          </Button>
          <Button className='nav-btn' onClick={handleNext}>
            →
          </Button>
        </View>
        <Text className='date-display'>{formatDateDisplay()}</Text>
        <View className='nav-buttons' style={{ opacity: 0 }}>
          <View className='nav-btn' />
        </View>
      </View>

      <View className='view-mode-switch'>
        <Button
          className={`mode-btn ${viewMode === 'day' ? 'active' : ''}`}
          onClick={() => onViewModeChange('day')}
        >
          日视图
        </Button>
        <Button
          className={`mode-btn ${viewMode === 'week' ? 'active' : ''}`}
          onClick={() => onViewModeChange('week')}
        >
          周视图
        </Button>
        <Button
          className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => onViewModeChange('month')}
        >
          月视图
        </Button>
      </View>
    </View>
  )
}
