import { View } from '@tarojs/components'
import './index.scss'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'cute' | 'gradient' | 'transparent'
  padding?: 'small' | 'medium' | 'large'
  shadow?: 'none' | 'soft' | 'medium' | 'strong'
  hoverable?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  header?: React.ReactNode
  footer?: React.ReactNode
}

/**
 * 🎴 可爱卡片组件
 * 支持多种样式变体和交互效果
 */
export default function Card({
  children,
  variant = 'cute',
  padding = 'medium',
  shadow = 'soft',
  hoverable = false,
  onClick,
  className = '',
  style,
  header,
  footer,
}: CardProps) {
  const classNames = [
    'cute-card',
    `cute-card--${variant}`,
    `cute-card--padding-${padding}`,
    `cute-card--shadow-${shadow}`,
    hoverable && 'cute-card--hoverable',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <View
      className={classNames}
      onClick={onClick}
      style={style}
    >
      {header && <View className='cute-card__header'>{header}</View>}
      <View className='cute-card__content'>{children}</View>
      {footer && <View className='cute-card__footer'>{footer}</View>}
      
      {/* ✨ 装饰元素 */}
      {variant === 'cute' && (
        <View className='cute-card__decoration'>
          <Text className='decoration-heart'>💕</Text>
        </View>
      )}
    </View>
  )
}
