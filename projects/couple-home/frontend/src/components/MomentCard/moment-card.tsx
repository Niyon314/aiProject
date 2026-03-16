import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './moment-card.scss'

interface MomentCardProps {
  moment: {
    id: string
    title?: string
    description?: string
    images: string[]
    location?: string
    tags: string[]
    likes: number
    user: {
      username: string
      avatar?: string
    }
    createdAt: string
  }
  onLike?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function MomentCard({ moment, onLike, onDelete }: MomentCardProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  // 处理点赞
  const handleLike = () => {
    if (onLike) {
      onLike(moment.id)
    } else {
      Taro.showToast({ title: '点赞成功 💕', icon: 'success' })
    }
  }

  // 处理删除
  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个瞬间吗？',
      success: (res) => {
        if (res.confirm) {
          if (onDelete) {
            onDelete(moment.id)
          }
        }
      },
    })
  }

  // 预览图片
  const previewImages = () => {
    Taro.previewImage({
      urls: moment.images,
      current: 0,
    })
  }

  return (
    <View className='moment-card'>
      <View className='moment-images' onClick={previewImages}>
        {moment.images.slice(0, 1).map((img, idx) => (
          <Image 
            key={idx} 
            className='moment-image' 
            src={img} 
            mode='aspectFill'
          />
        ))}
        {moment.images.length > 1 && (
          <View className='image-count'>
            +{moment.images.length - 1}
          </View>
        )}
      </View>
      
      <View className='moment-info'>
        <Text className='moment-title'>{moment.title || '无题'}</Text>
        {moment.description && (
          <Text className='moment-desc'>{moment.description}</Text>
        )}
        
        <View className='moment-tags'>
          {moment.tags.map(tag => (
            <Text key={tag} className='moment-tag'>#{tag}</Text>
          ))}
        </View>
        
        <View className='moment-footer'>
          <View className='moment-meta'>
            <Text className='moment-date'>{formatDate(moment.createdAt)}</Text>
            {moment.location && (
              <Text className='moment-location'>📍 {moment.location}</Text>
            )}
          </View>
          
          <View className='moment-actions'>
            <Button className='like-btn' onClick={handleLike}>
              💕 {moment.likes}
            </Button>
            <Button className='delete-btn' onClick={handleDelete}>
              🗑️
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}
