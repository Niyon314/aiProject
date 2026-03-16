import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import theme from '../../styles/theme'

// 🌸 可爱功能卡片数据
const featureCards = [
  { icon: '🍽️', label: '今天吃什么', path: '/pages/couple/eating/eating', color: theme.secondary.peach },
  { icon: '🧹', label: '今日家务', path: '/pages/couple/tasks/tasks', color: theme.secondary.mint },
  { icon: '💰', label: '共同账单', path: '/pages/couple/bills/bills', color: theme.secondary.lemon },
  { icon: '📅', label: '日程安排', path: '/pages/couple/calendar/calendar', color: theme.secondary.sky },
  { icon: '📸', label: '甜蜜瞬间', path: '/pages/couple/moments/moments', color: theme.secondary.lavender },
  { icon: '🎉', label: '纪念日', path: '/pages/couple/anniversaries/anniversaries', color: theme.secondary.peach },
  { icon: '💌', label: '情书信箱', path: '/pages/couple/letters/letters', color: theme.primary.light },
]

export default function Index() {
  const navigateTo = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <View className='index'>
      {/* 🌸 顶部欢迎区 */}
      <View className='welcome-section'>
        <View className='header-decorator'>
          <Text className='decorator-icon left'>🌸</Text>
          <Text className='decorator-icon right'>🌸</Text>
        </View>
        
        <View className='welcome-content'>
          <Text className='greeting'>💕 欢迎来到</Text>
          <Text className='title'>情侣小家</Text>
          <Text className='subtitle'>记录我们的甜蜜日常 ✨</Text>
        </View>
        
        {/* 爱心装饰 */}
        <View className='hearts-decoration'>
          <Text className='floating-heart'>💗</Text>
          <Text className='floating-heart' style={{ animationDelay: '0.5s' }}>💖</Text>
          <Text className='floating-heart' style={{ animationDelay: '1s' }}>💕</Text>
        </View>
      </View>

      {/* 🎀 快捷功能区 */}
      <View className='features-section'>
        <View className='section-header'>
          <Text className='section-icon'>🎀</Text>
          <Text className='section-title'>我们的甜蜜功能</Text>
        </View>
        
        <View className='features-grid'>
          {featureCards.map((card, index) => (
            <View
              key={index}
              className='feature-card'
              style={{ backgroundColor: card.color }}
              onClick={() => navigateTo(card.path)}
            >
              <View className='feature-icon-wrapper'>
                <Text className='feature-icon'>{card.icon}</Text>
              </View>
              <Text className='feature-label'>{card.label}</Text>
              <View className='feature-shine' />
            </View>
          ))}
        </View>
      </View>

      {/* 🍰 温馨提示卡片 */}
      <View className='tips-section'>
        <View className='tips-card'>
          <View className='tips-header'>
            <Text className='tips-icon'>☀️</Text>
            <Text className='tips-title'>今日小提醒</Text>
          </View>
          <Text className='tips-content'>
            记得给对方一个暖暖的拥抱哦～ 💕
          </Text>
          <View className='tips-decoration'>
            <Text>🌙</Text>
            <Text>⭐</Text>
            <Text>🌈</Text>
          </View>
        </View>
      </View>

      {/* 🎀 底部装饰 */}
      <View className='footer-decoration'>
        <Text className='footer-text'>
          Made with 💖 for You Two
        </Text>
        <View className='footer-emojis'>
          <Text>🏠</Text>
          <Text>👫</Text>
          <Text>💕</Text>
        </View>
      </View>
    </View>
  )
}
