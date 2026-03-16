import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './theme-showcase.scss'
import theme from '../../styles/theme'
import { Button, Card, Input, Loading, Decorator } from '../../components'

/**
 * 🎨 主题展示页
 * 展示所有可爱风格的组件和配色
 */
export default function ThemeShowcase() {
  const colorBoxes = [
    { name: '樱花粉', color: theme.primary.light },
    { name: '主粉色', color: theme.primary.main },
    { name: '深粉色', color: theme.primary.dark },
    { name: '薄荷绿', color: theme.secondary.mint },
    { name: '薰衣草紫', color: theme.secondary.lavender },
    { name: '蜜桃色', color: theme.secondary.peach },
    { name: '天空蓝', color: theme.secondary.sky },
    { name: '柠檬黄', color: theme.secondary.lemon },
  ]

  return (
    <ScrollView className='theme-showcase' scrollY>
      {/* 🌸 头部 */}
      <View className='showcase-header'>
        <Decorator type='flowers' position='top' count={4} />
        <Text className='showcase-title'>🎨 主题展示</Text>
        <Text className='showcase-subtitle'>少女可爱风格组件库</Text>
      </View>

      {/* 🎨 配色方案 */}
      <View className='showcase-section'>
        <Text className='section-title'>🌈 配色方案</Text>
        <View className='color-grid'>
          {colorBoxes.map((item, index) => (
            <View
              key={index}
              className='color-box'
              style={{ backgroundColor: item.color }}
            >
              <Text className='color-name'>{item.name}</Text>
              <Text className='color-value'>{item.color}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 🔘 按钮组件 */}
      <View className='showcase-section'>
        <Text className='section-title'>🔘 按钮组件</Text>
        <View className='component-grid'>
          <Button type='primary'>主按钮 💕</Button>
          <Button type='secondary'>次按钮 🎀</Button>
          <Button type='outline'>边框按钮 🌸</Button>
          <Button type='gradient'>渐变按钮 ✨</Button>
          <Button size='small'>小按钮</Button>
          <Button size='large'>大按钮</Button>
          <Button loading>加载中</Button>
          <Button icon='🎉'>带图标</Button>
        </View>
      </View>

      {/* 🎴 卡片组件 */}
      <View className='showcase-section'>
        <Text className='section-title'>🎴 卡片组件</Text>
        <Card variant='cute' className='showcase-card'>
          <Text className='card-title'>可爱卡片 💕</Text>
          <Text className='card-content'>
            这是一个可爱风格的卡片组件，带有圆角、柔和阴影和爱心装饰～
          </Text>
        </Card>
        
        <Card variant='gradient' className='showcase-card'>
          <Text className='card-title-white'>渐变卡片 ✨</Text>
          <Text className='card-content-white'>
            渐变背景的卡片，适合突出显示重要内容
          </Text>
        </Card>
      </View>

      {/* 📝 输入框组件 */}
      <View className='showcase-section'>
        <Text className='section-title'>📝 输入框组件</Text>
        <Input
          label='用户名'
          icon='👤'
          placeholder='请输入用户名'
        />
        <Input
          label='密码'
          icon='🔐'
          type='password'
          placeholder='请输入密码'
        />
        <Input
          label='邮箱'
          icon='📧'
          type='email'
          placeholder='请输入邮箱'
          error='邮箱格式不正确'
        />
      </View>

      {/* ⏳ 加载组件 */}
      <View className='showcase-section'>
        <Text className='section-title'>⏳ 加载组件</Text>
        <View className='loading-grid'>
          <Loading size='small' variant='heart' text='小心心' />
          <Loading size='medium' variant='dots' text='点点点' />
          <Loading size='large' variant='spinner' text='转圈圈' />
        </View>
      </View>

      {/* ✨ 装饰元素 */}
      <View className='showcase-section'>
        <Text className='section-title'>✨ 装饰元素</Text>
        <View className='decorator-grid'>
          <View className='decorator-box'>
            <Decorator type='hearts' position='scattered' count={5} />
            <Text className='decorator-label'>爱心</Text>
          </View>
          <View className='decorator-box'>
            <Decorator type='flowers' position='scattered' count={5} />
            <Text className='decorator-label'>花朵</Text>
          </View>
          <View className='decorator-box'>
            <Decorator type='stars' position='scattered' count={5} />
            <Text className='decorator-label'>星星</Text>
          </View>
        </View>
      </View>

      {/* 📏 圆角展示 */}
      <View className='showcase-section'>
        <Text className='section-title'>📐 圆角设计</Text>
        <View className='radius-grid'>
          <View className='radius-box' style={{ borderRadius: theme.radius.small }}>
            <Text>小圆角 12px</Text>
          </View>
          <View className='radius-box' style={{ borderRadius: theme.radius.medium }}>
            <Text>中圆角 16px</Text>
          </View>
          <View className='radius-box' style={{ borderRadius: theme.radius.large }}>
            <Text>大圆角 20px</Text>
          </View>
          <View className='radius-box' style={{ borderRadius: theme.radius.xl }}>
            <Text>超大圆角 24px</Text>
          </View>
        </View>
      </View>

      {/* 🎀 底部 */}
      <View className='showcase-footer'>
        <Decorator type='sparkles' position='bottom' count={4} />
        <Text className='footer-text'>Made with 💖 for Couple Home</Text>
        <Text className='footer-emojis'>🏠 👫 💕 🌸 🎀</Text>
      </View>
    </ScrollView>
  )
}
