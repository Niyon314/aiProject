import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './login.scss'

export default function Login() {
  return (
    <View className='login-page'>
      <View className='logo'>💕</View>
      <Text className='title'>情侣小家</Text>
      <Text className='subtitle'>记录我们的甜蜜日常</Text>
      
      <View className='form'>
        <Input className='input' type='text' placeholder='请输入邮箱' />
        <Input className='input' type='password' placeholder='请输入密码' />
        <Button className='btn btn-primary'>登录</Button>
        <Button className='btn btn-secondary'>注册账号</Button>
      </View>
    </View>
  )
}
