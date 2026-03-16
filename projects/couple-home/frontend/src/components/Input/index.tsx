import { useState } from 'react'
import { Input as TaroInput, View, Text } from '@tarojs/components'
import './index.scss'

interface InputProps {
  type?: 'text' | 'password' | 'number' | 'email' | 'tel'
  placeholder?: string
  value?: string
  disabled?: boolean
  clearable?: boolean
  icon?: string
  label?: string
  error?: string
  maxLength?: number
  onInput?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  className?: string
  style?: React.CSSProperties
}

/**
 * 📝 可爱输入框组件
 * 支持图标、标签、错误提示等功能
 */
export default function Input({
  type = 'text',
  placeholder = '',
  value = '',
  disabled = false,
  clearable = false,
  icon,
  label,
  error,
  maxLength,
  onInput,
  onFocus,
  onBlur,
  className = '',
  style,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showClear, setShowClear] = useState(false)

  const handleInput = (e: any) => {
    const val = e.detail.value
    onInput?.(val)
    setShowClear(clearable && val.length > 0)
  }

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
    setShowClear(clearable && value.length > 0)
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
    setShowClear(false)
  }

  const handleClear = () => {
    onInput?.('')
  }

  const classNames = [
    'cute-input-wrapper',
    isFocused && 'cute-input-wrapper--focused',
    error && 'cute-input-wrapper--error',
    disabled && 'cute-input-wrapper--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <View className={classNames} style={style}>
      {label && (
        <View className='cute-input__label'>
          {icon && <Text className='cute-input__label-icon'>{icon}</Text>}
          <Text className='cute-input__label-text'>{label}</Text>
        </View>
      )}
      
      <View className='cute-input__container'>
        {icon && !label && (
          <Text className='cute-input__icon'>{icon}</Text>
        )}
        
        <TaroInput
          className='cute-input__field'
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {showClear && (
          <Text className='cute-input__clear' onClick={handleClear}>
            ✕
          </Text>
        )}
      </View>
      
      {error && (
        <Text className='cute-input__error'>{error}</Text>
      )}
    </View>
  )
}
