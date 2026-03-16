import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  variant?: 'spinner' | 'dots' | 'heart'
  fullScreen?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * ⏳ 可爱加载组件
 * 多种加载动画样式
 */
export default function Loading({
  size = 'medium',
  text = '加载中...',
  variant = 'heart',
  fullScreen = false,
  className = '',
  style,
}: LoadingProps) {
  const classNames = [
    'cute-loading',
    `cute-loading--${size}`,
    `cute-loading--${variant}`,
    fullScreen && 'cute-loading--fullscreen',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <Text className='loader-spinner'>🔄</Text>
      case 'dots':
        return (
          <View className='loader-dots'>
            <Text className='dot'>💕</Text>
            <Text className='dot'>💕</Text>
            <Text className='dot'>💕</Text>
          </View>
        )
      case 'heart':
      default:
        return <Text className='loader-heart'>💗</Text>
    }
  }

  return (
    <View className={classNames} style={style}>
      {renderLoader()}
      {text && <Text className='loading-text'>{text}</Text>}
    </View>
  )
}
