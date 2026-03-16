import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadImages } from '../../utils/request'
import MomentCard from '../../components/MomentCard/moment-card'
import './moments.scss'

interface Moment {
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

interface TimelineGroup {
  year: number
  month: number
  moments: Moment[]
}

export default function Moments() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [timeline, setTimeline] = useState<TimelineGroup[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  const coupleId = Taro.getStorageSync('coupleId')

  useEffect(() => {
    loadMoments()
    loadTags()
  }, [selectedTag])

  // 加载照片列表
  const loadMoments = async () => {
    setLoading(true)
    try {
      const res = await request({
        url: selectedTag 
          ? `/moments/tag/${encodeURIComponent(selectedTag)}?coupleId=${coupleId}`
          : `/moments?coupleId=${coupleId}`,
      })
      setMoments(res.data || [])
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 加载时间线
  const loadTimeline = async () => {
    setLoading(true)
    try {
      const res = await request({
        url: `/moments/timeline?coupleId=${coupleId}`,
      })
      setTimeline(res)
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 加载标签
  const loadTags = async () => {
    try {
      const res = await request({
        url: `/moments/tags?coupleId=${coupleId}`,
      })
      setTags(res)
    } catch (error) {
      console.error('加载标签失败', error)
    }
  }

  // 选择照片上传
  const chooseAndUploadImages = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths.length > 0) {
        uploadMoment(res.tempFilePaths)
      }
    } catch (error) {
      console.error('选择照片失败', error)
    }
  }

  // 上传瞬间
  const uploadMoment = async (imagePaths: string[]) => {
    try {
      const { title, description, tags: tagStr } = await showMomentInput()
      
      if (!title && imagePaths.length === 0) return

      setLoading(true)

      const uploadedUrls: string[] = []
      for (const path of imagePaths) {
        const url = await uploadImages(path, 'moments')
        if (url) uploadedUrls.push(url)
      }

      await request({
        url: '/moments',
        method: 'POST',
        data: {
          title,
          description,
          images: uploadedUrls,
          tags: tagStr ? tagStr.split(',').map((t: string) => t.trim()) : [],
          userId: Taro.getStorageSync('userId'),
          coupleId,
        },
      })

      Taro.showToast({ title: '发布成功 💕', icon: 'success' })
      loadMoments()
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 显示输入框
  const showMomentInput = (): Promise<any> => {
    return new Promise((resolve) => {
      Taro.showModal({
        title: '📸 发布新瞬间',
        editable: true,
        placeholderText: '这一刻的心情...',
        success: (res) => {
          if (res.confirm) {
            Taro.prompt({
              title: '🏷️ 添加标签',
              placeholder: '如：旅行、约会、生日',
              success: (promptRes) => {
                resolve({ title: res.content || '', description: res.content || '', tags: promptRes.content || '' })
              },
              fail: () => resolve({ title: res.content || '', description: res.content || '', tags: '' }),
            })
          } else {
            resolve(null)
          }
        },
        fail: () => resolve(null),
      })
    })
  }

  // 点赞
  const handleLike = async (momentId: string) => {
    try {
      await request({ url: `/moments/${momentId}/like`, method: 'POST' })
      setMoments(prev => prev.map(m => m.id === momentId ? { ...m, likes: m.likes + 1 } : m))
      Taro.showToast({ title: '点赞成功 💕', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '点赞失败', icon: 'none' })
    }
  }

  // 删除瞬间
  const handleDelete = async (momentId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个瞬间吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({ url: `/moments/${momentId}`, method: 'DELETE' })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            loadMoments()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      },
    })
  }

  // 获取回忆
  const loadMemories = async () => {
    try {
      const res = await request({
        url: `/moments/memories?userId=${Taro.getStorageSync('userId')}&coupleId=${coupleId}`,
      })
      if (res.length > 0) {
        Taro.showModal({
          title: '📸 回忆杀 · 去年的今天',
          content: `还记得这一天吗？${res.length}个美好瞬间`,
          showCancel: false,
        })
      }
    } catch (error) {
      console.error('加载回忆失败', error)
    }
  }

  return (
    <View className='moments-page'>
      {/* 头部 */}
      <View className='header'>
        <View className='header-top'>
          <Text className='title'>📸 甜蜜瞬间</Text>
          <View className='view-mode-toggle'>
            <Button 
              className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => { setViewMode('grid'); loadMoments() }}
            >
              网格
            </Button>
            <Button 
              className={`mode-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => { setViewMode('timeline'); loadTimeline() }}
            >
              时间线
            </Button>
          </View>
        </View>
        <Text className='subtitle'>记录我们的每一个美好时刻 💕</Text>
      </View>

      {/* 标签筛选 */}
      <ScrollView className='tags-scroll' scrollX>
        <View className='tags-container'>
          <View 
            className={`tag-item ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            全部
          </View>
          {tags.map(tag => (
            <View
              key={tag}
              className={`tag-item ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 发布按钮 */}
      <View className='upload-btn-wrapper'>
        <Button className='upload-btn' onClick={chooseAndUploadImages}>
          <Text className='upload-icon'>📷</Text>
          <Text>上传照片</Text>
        </Button>
      </View>

      {/* 内容区域 */}
      <ScrollView className='content-scroll' scrollY>
        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : viewMode === 'grid' ? (
          /* 网格视图 */}
          <View className='moments-grid'>
            {moments.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-emoji'>📸</Text>
                <Text className='empty-text'>暂无瞬间记录</Text>
                <Text className='empty-hint'>快上传第一张照片吧~</Text>
              </View>
            ) : (
              moments.map(moment => (
                <MomentCard 
                  key={moment.id} 
                  moment={moment}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))
            )}
          </View>
        ) : (
          /* 时间线视图 */}
          <View className='timeline'>
            {timeline.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-emoji'>📸</Text>
                <Text className='empty-text'>暂无瞬间记录</Text>
              </View>
            ) : (
              timeline.map((group, idx) => (
                <View key={idx} className='timeline-group'>
                  <View className='timeline-header'>
                    <Text className='timeline-date'>
                      {group.year}年{group.month}月
                    </Text>
                    <View className='timeline-line' />
                  </View>
                  <View className='timeline-moments'>
                    {group.moments.map(moment => (
                      <MomentCard 
                        key={moment.id} 
                        moment={moment}
                        onLike={handleLike}
                        onDelete={handleDelete}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
