import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  return (
    <View className='index'>
      <View className='welcome'>
        <Text className='title'>💕 情侣小家</Text>
        <Text className='subtitle'>记录我们的甜蜜日常</Text>
      </View>
      
      <View className='quick-actions'>
        <View className='action-card' onClick={() => Taro.navigateTo({ url: '/pages/couple/tasks/tasks' })}>
          <Text className='icon'>🧹</Text>
          <Text className='label'>今日家务</Text>
        </View>
        <View className='action-card' onClick={() => Taro.navigateTo({ url: '/pages/couple/bills/bills' })}>
          <Text className='icon'>💰</Text>
          <Text className='label'>共同账单</Text>
        </View>
        <View className='action-card' onClick={() => Taro.navigateTo({ url: '/pages/couple/calendar/calendar' })}>
          <Text className='icon'>📅</Text>
          <Text className='label'>日程安排</Text>
        </View>
        <View className='action-card' onClick={() => Taro.navigateTo({ url: '/pages/couple/moments/moments' })}>
          <Text className='icon'>📸</Text>
          <Text className='label'>甜蜜瞬间</Text>
        </View>
      </View>
    </View>
  )
}
