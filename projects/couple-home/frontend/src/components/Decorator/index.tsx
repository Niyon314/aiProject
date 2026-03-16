import { View, Text } from '@tarojs/components'
import './index.scss'

interface DecoratorProps {
  type?: 'hearts' | 'flowers' | 'stars' | 'sparkles' | 'ribbons'
  position?: 'top' | 'bottom' | 'left' | 'right' | 'corners' | 'scattered'
  count?: number
  animated?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * ✨ 可爱装饰元素组件
 * 添加少女心装饰效果
 */
export default function Decorator({
  type = 'hearts',
  position = 'scattered',
  count = 5,
  animated = true,
  className = '',
  style,
}: DecoratorProps) {
  const getEmojis = () => {
    switch (type) {
      case 'hearts':
        return ['💕', '💖', '💗', '💓', '💞', '❤️', '🩷']
      case 'flowers':
        return ['🌸', '🌺', '🌹', '🌷', '💐', '🌼']
      case 'stars':
        return ['⭐', '🌟', '✨', '💫', '🌙', '☀️']
      case 'sparkles':
        return ['✨', '💫', '🌟', '⚡', '💥']
      case 'ribbons':
        return ['🎀', '🎁', '🎈', '🎉', '🏆']
      default:
        return ['💕']
    }
  }

  const emojis = getEmojis()

  const classNames = [
    'cute-decorator',
    `cute-decorator--${position}`,
    animated && 'cute-decorator--animated',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <View className={classNames} style={style}>
      {Array.from({ length: count }).map((_, index) => {
        const emoji = emojis[index % emojis.length]
        const delay = animated ? (index * 0.2).toFixed(1) + 's' : '0s'
        const size = 20 + (index % 3) * 8
        
        return (
          <Text
            key={index}
            className='decorator-item'
            style={{
              animationDelay: delay,
              fontSize: `${size}px`,
            }}
          >
            {emoji}
          </Text>
        )
      })}
    </View>
  )
}
