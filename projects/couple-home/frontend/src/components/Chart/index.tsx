import { View, Text } from '@tarojs/components'
import './index.scss'

interface ChartData {
  label: string
  value: number
  color?: string
  percentage?: string
}

interface ChartProps {
  data: ChartData[]
  type?: 'bar' | 'pie' | 'donut'
  title?: string
  showValues?: boolean
  showPercentage?: boolean
  height?: number
  className?: string
}

/**
 * 📊 可爱图表组件
 * 支持条形图、饼图等，少女心风格
 */
export default function Chart({
  data,
  type = 'bar',
  title,
  showValues = true,
  showPercentage = false,
  height = 300,
  className = '',
}: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  // 📊 条形图
  if (type === 'bar') {
    return (
      <View className={`cute-chart cute-chart--bar ${className}`} style={{ height }}>
        {title && <Text className='chart-title'>{title}</Text>}
        
        <View className='chart-bars'>
          {data.map((item, index) => (
            <View key={index} className='chart-bar-item'>
              <View className='chart-bar-label'>
                <Text className='label-text'>{item.label}</Text>
                {showValues && (
                  <Text className='label-value'>¥{item.value.toFixed(2)}</Text>
                )}
              </View>
              
              <View className='chart-bar-container'>
                <View
                  className='chart-bar-fill'
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || '#FF6B81',
                  }}
                >
                  {showPercentage && item.percentage && (
                    <Text className='chart-bar-percentage'>{item.percentage}%</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }

  // 🥧 饼图/甜甜圈图
  if (type === 'pie' || type === 'donut') {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = 0

    const segments = data.map((item, index) => {
      const percentage = (item.value / total) * 100
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      currentAngle += angle

      // 计算 SVG 路径
      const startRad = (startAngle - 90) * (Math.PI / 180)
      const endRad = (startAngle + angle - 90) * (Math.PI / 180)
      
      const x1 = 50 + 40 * Math.cos(startRad)
      const y1 = 50 + 40 * Math.sin(startRad)
      const x2 = 50 + 40 * Math.cos(endRad)
      const y2 = 50 + 40 * Math.sin(endRad)

      const largeArcFlag = angle > 180 ? 1 : 0

      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      return {
        ...item,
        percentage: percentage.toFixed(1),
        pathData,
      }
    })

    return (
      <View className={`cute-chart cute-chart--pie ${className}`} style={{ height }}>
        {title && <Text className='chart-title'>{title}</Text>}
        
        <View className='chart-pie-container'>
          <svg viewBox='0 0 100 100' className='chart-pie-svg'>
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color || '#FF6B81'}
                className='chart-pie-segment'
              />
            ))}
            
            {type === 'donut' && (
              <circle cx='50' cy='50' r='25' fill='white' />
            )}
          </svg>
          
          {type === 'donut' && (
            <View className='chart-pie-center'>
              <Text className='center-total'>¥{total.toFixed(0)}</Text>
              <Text className='center-label'>总计</Text>
            </View>
          )}
        </View>

        <View className='chart-legend'>
          {segments.map((segment, index) => (
            <View key={index} className='legend-item'>
              <View
                className='legend-color'
                style={{ backgroundColor: segment.color }}
              />
              <Text className='legend-label'>{segment.label}</Text>
              {showValues && (
                <Text className='legend-value'>
                  ¥{segment.value.toFixed(2)}
                  {showPercentage && ` (${segment.percentage}%)`}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    )
  }

  return null
}

/**
 * 📊 快速创建分类图表数据
 */
export function createCategoryChartData(categories: Array<{
  category: string
  categoryName: string
  amount: number
}>, colors?: string[]) {
  const defaultColors = [
    '#FF6B81', '#1E90FF', '#FFA502', '#9B59B6',
    '#E84393', '#2ED573', '#3742FA', '#636E72',
  ]

  return categories.map((cat, index) => ({
    label: cat.categoryName.split(' ').slice(1).join(' ') || cat.categoryName,
    value: cat.amount,
    color: colors?.[index] || defaultColors[index % defaultColors.length],
    category: cat.category,
  }))
}
