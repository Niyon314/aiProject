import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './profile.scss'

export default function Profile() {
  return (
    <View className='profile-page'>
      <View className='header'>
        <Image className='avatar' src='/assets/icons/default-avatar.png' />
        <Text className='username'>用户名</Text>
      </View>
      
      <View className='menu'>
        <View className='menu-item'>
          <Text className='icon'>👫</Text>
          <Text className='label'>情侣空间</Text>
          <Text className='arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='icon'>⚙️</Text>
          <Text className='label'>设置</Text>
          <Text className='arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='icon'>❓</Text>
          <Text className='label'>帮助与反馈</Text>
          <Text className='arrow'>›</Text>
        </View>
      </View>
      
      <View className='logout' onClick={() => Taro.clearStorageSync()}>
        退出登录
      </View>
    </View>
  )
}
