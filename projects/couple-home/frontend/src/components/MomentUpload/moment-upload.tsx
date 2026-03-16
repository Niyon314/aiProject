import { useState } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { uploadImages } from '../../utils/request'
import './moment-upload.scss'

interface MomentUploadProps {
  onSuccess?: (moment: any) => void
  onCancel?: () => void
}

interface ImagePreview {
  path: string
  uploaded?: boolean
  url?: string
}

export default function MomentUpload({ onSuccess, onCancel }: MomentUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)

  // 选择照片
  const chooseImages = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      const newImages: ImagePreview[] = res.tempFilePaths.map(path => ({
        path,
        uploaded: false,
      }))

      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('选择照片失败', error)
    }
  }

  // 删除照片
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // 发布瞬间
  const publishMoment = async () => {
    if (images.length === 0 && !title) {
      Taro.showToast({ title: '请至少选择照片或填写标题', icon: 'none' })
      return
    }

    setUploading(true)

    try {
      // 上传所有图片
      const uploadedUrls: string[] = []
      for (const img of images) {
        if (!img.uploaded) {
          const url = await uploadImages(img.path, 'moments')
          if (url) {
            uploadedUrls.push(url)
          }
        } else if (img.url) {
          uploadedUrls.push(img.url)
        }
      }

      // 创建瞬间
      const res = await Taro.request({
        url: `${process.env.API_BASE_URL}/moments`,
        method: 'POST',
        data: {
          title,
          description,
          images: uploadedUrls,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          userId: Taro.getStorageSync('userId'),
          coupleId: Taro.getStorageSync('coupleId'),
        },
      })

      if (res.statusCode === 201 || res.statusCode === 200) {
        Taro.showToast({ title: '发布成功 💕', icon: 'success' })
        
        if (onSuccess) {
          onSuccess(res.data)
        }
        
        // 重置
        setImages([])
        setTitle('')
        setDescription('')
        setTags('')
      }
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className='moment-upload'>
      <View className='upload-header'>
        <Text className='upload-title'>📸 发布新瞬间</Text>
        {onCancel && (
          <Button className='cancel-btn' onClick={onCancel}>✕</Button>
        )}
      </View>

      {/* 照片预览区 */}
      <View className='image-preview-area'>
        {images.map((img, index) => (
          <View key={index} className='preview-item'>
            <Image className='preview-image' src={img.path} mode='aspectFill' />
            <Button 
              className='remove-btn' 
              onClick={() => removeImage(index)}
            >
              ✕
            </Button>
            {img.uploaded && <View className='uploaded-badge'>✓</View>}
          </View>
        ))}
        
        {images.length < 9 && (
          <View className='add-image-btn' onClick={chooseImages}>
            <Text className='add-icon'>📷</Text>
            <Text className='add-text'>添加照片</Text>
          </View>
        )}
      </View>

      {/* 输入区域 */}
      <View className='input-area'>
        <View className='input-group'>
          <Text className='input-label'>标题</Text>
          <input
            className='input-field'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='给这一刻起个名字吧~'
            maxLength={50}
          />
        </View>

        <View className='input-group'>
          <Text className='input-label'>描述</Text>
          <textarea
            className='textarea-field'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='记录此刻的心情...'
            maxLength={200}
          />
        </View>

        <View className='input-group'>
          <Text className='input-label'>标签 🏷️</Text>
          <input
            className='input-field'
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder='如：旅行、约会、生日（多个用逗号分隔）'
            maxLength={100}
          />
        </View>
      </View>

      {/* 发布按钮 */}
      <Button 
        className='publish-btn' 
        onClick={publishMoment}
        disabled={uploading}
      >
        {uploading ? '发布中...' : '✨ 发布瞬间'}
      </Button>
    </View>
  )
}
