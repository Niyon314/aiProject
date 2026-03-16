import { View, Text } from '@tarojs/components'
import './moments.scss'

export default function Moments() {
  return (
    <View className='moments-page'>
      <View className='header'>
        <Text className='title'>📸 甜蜜瞬间</Text>
      </View>
      
      <View className='moments-list'>
        <Text className='empty-tip'>暂无瞬间记录</Text>
      </View>
    </View>
  )
}
