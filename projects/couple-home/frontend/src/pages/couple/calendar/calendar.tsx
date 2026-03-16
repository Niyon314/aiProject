import { View, Text } from '@tarojs/components'
import './calendar.scss'

export default function Calendar() {
  return (
    <View className='calendar-page'>
      <View className='header'>
        <Text className='title'>📅 日程安排</Text>
      </View>
      
      <View className='calendar-list'>
        <Text className='empty-tip'>暂无日程安排</Text>
      </View>
    </View>
  )
}
