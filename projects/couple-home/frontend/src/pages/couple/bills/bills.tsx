import { View, Text } from '@tarojs/components'
import './bills.scss'

export default function Bills() {
  return (
    <View className='bills-page'>
      <View className='header'>
        <Text className='title'>💰 共同账单</Text>
      </View>
      
      <View className='summary'>
        <View className='summary-item'>
          <Text className='amount'>¥0</Text>
          <Text className='label'>本月总支出</Text>
        </View>
      </View>
      
      <View className='bill-list'>
        <Text className='empty-tip'>暂无账单记录</Text>
      </View>
    </View>
  )
}
