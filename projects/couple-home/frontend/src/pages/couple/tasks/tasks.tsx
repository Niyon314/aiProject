import { View, Text } from '@tarojs/components'
import './tasks.scss'

export default function Tasks() {
  return (
    <View className='tasks-page'>
      <View className='header'>
        <Text className='title'>🧹 家务任务</Text>
      </View>
      
      <View className='task-list'>
        <View className='task-item'>
          <View className='checkbox'></View>
          <View className='task-info'>
            <Text className='task-title'>洗碗</Text>
            <Text className='task-desc'>今日待办</Text>
          </View>
        </View>
        <View className='task-item'>
          <View className='checkbox'></View>
          <View className='task-info'>
            <Text className='task-title'>倒垃圾</Text>
            <Text className='task-desc'>每周任务</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
