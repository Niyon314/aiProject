import { Button as TaroButton } from '@tarojs/components'
import './index.scss'

interface ButtonProps {
  children: React.ReactNode
  type?: 'primary' | 'secondary' | 'outline' | 'gradient'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  icon?: string
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

/**
 * 🎀 可爱按钮组件
 * 少女心风格，支持多种类型和尺寸
 */
export default function Button({
  children,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = '',
  style,
}: ButtonProps) {
  const classNames = [
    'cute-button',
    `cute-button--${type}`,
    `cute-button--${size}`,
    disabled && 'cute-button--disabled',
    loading && 'cute-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <TaroButton
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
    >
      {loading && <Text className='button-loading-spinner'>🔄</Text>}
      {icon && <Text className='button-icon'>{icon}</Text>}
      <Text className='button-text'>{children}</Text>
    </TaroButton>
  )
}
