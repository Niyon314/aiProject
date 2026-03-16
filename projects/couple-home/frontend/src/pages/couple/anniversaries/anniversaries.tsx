import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '../../../styles/theme'
import Card from '../../../components/Card'
import CountdownCard from './components/CountdownCard'
import CreateAnniversaryModal from './components/CreateAnniversaryModal'
import './anniversaries.scss'

interface Anniversary {
  id: string
  title: string
  date: string
  type: string
  description?: string
  isRecurring: boolean
  enableReminder: boolean
  reminderDays: number[]
  userId: string
  coupleId?: string
  countdown?: {
    days: number
    nextDate: string
    isToday: boolean
    message: string
  }
  user?: {
    username: string
    avatar?: string
  }
}

export default function Anniversaries() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  const coupleId = Taro.getStorageSync('coupleId') || ''
  const userId = Taro.getStorageSync('userId') || ''

  // 加载纪念日列表
  const loadAnniversaries = async () => {
    setLoading(true)
    try {
      let url = `/api/anniversaries?`
      if (coupleId) {
        url += `coupleId=${coupleId}`
      } else if (userId) {
        url += `userId=${userId}`
      }

      const res = await Taro.request({ url })
      if (res.statusCode === 200) {
        setAnniversaries(res.data as Anniversary[])
      }
    } catch (error) {
      console.error('加载纪念日失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnniversaries()
  }, [coupleId, userId])

  // 创建纪念日
  const handleCreateAnniversary = async (data: any) => {
    try {
      const res = await Taro.request({
        url: '/api/anniversaries',
        method: 'POST',
        data: {
          ...data,
          userId,
          coupleId: coupleId || undefined,
        },
      })

      if (res.statusCode === 201) {
        Taro.showToast({ title: '创建成功 💕', icon: 'success' })
        setShowCreateModal(false)
        loadAnniversaries()
      }
    } catch (error) {
      console.error('创建纪念日失败:', error)
      Taro.showToast({ title: '创建失败', icon: 'none' })
    }
  }

  // 删除纪念日
  const handleDeleteAnniversary = async (id: string) => {
    try {
      const res = await Taro.request({
        url: `/api/anniversaries/${id}`,
        method: 'DELETE',
      })

      if (res.statusCode === 200) {
        Taro.showToast({ title: '删除成功', icon: 'success' })
        loadAnniversaries()
      }
    } catch (error) {
      console.error('删除纪念日失败:', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  // 编辑纪念日
  const handleEditAnniversary = (anniversary: Anniversary) => {
    Taro.navigateTo({
      url: `/pages/couple/anniversaries/edit?id=${anniversary.id}`,
    })
  }

  // 获取类型对应的 emoji 和文字
  const getTypeInfo = (type: string) => {
    const typeMap: Record<string, { emoji: string; label: string }> = {
      birthday: { emoji: '🎂', label: '生日' },
      first_date: { emoji: '💕', label: '在一起' },
      engagement: { emoji: '💍', label: '订婚' },
      wedding: { emoji: '💒', label: '结婚' },
      other: { emoji: '🎉', label: '其他' },
    }
    return typeMap[type] || { emoji: '💕', label: '纪念日' }
  }

  // 过滤纪念日
  const filteredAnniversaries = filterType === 'all'
    ? anniversaries
    : anniversaries.filter(a => a.type === filterType)

  // 按倒计时排序（最近的在前）
  const sortedAnniversaries = [...filteredAnniversaries].sort((a, b) => {
    const aDays = a.countdown?.days ?? 999
    const bDays = b.countdown?.days ?? 999
    return aDays - bDays
  })

  return (
    <View className='anniversaries-page'>
      {/* 头部 */}
      <View className='page-header'>
        <Text className='page-title'>💕 纪念日</Text>
        <Text className='page-subtitle'>记录每一个特别的日子</Text>
      </View>

      {/* 筛选标签 */}
      <ScrollView className='filter-scroll' scrollX>
        <View className='filter-container'>
          <View
            className={`filter-tag ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </View>
          <View
            className={`filter-tag ${filterType === 'first_date' ? 'active' : ''}`}
            onClick={() => setFilterType('first_date')}
          >
            💕 在一起
          </View>
          <View
            className={`filter-tag ${filterType === 'birthday' ? 'active' : ''}`}
            onClick={() => setFilterType('birthday')}
          >
            🎂 生日
          </View>
          <View
            className={`filter-tag ${filterType === 'wedding' ? 'active' : ''}`}
            onClick={() => setFilterType('wedding')}
          >
            💒 结婚
          </View>
          <View
            className={`filter-tag ${filterType === 'other' ? 'active' : ''}`}
            onClick={() => setFilterType('other')}
          >
            🎉 其他
          </View>
        </View>
      </ScrollView>

      {/* 纪念日列表 */}
      <ScrollView className='anniversaries-list' scrollY>
        {loading ? (
          <View className='loading-tip'>加载中... 💕</View>
        ) : sortedAnniversaries.length === 0 ? (
          <View className='empty-tip'>
            <Text className='empty-emoji'>💕</Text>
            <Text>暂无纪念日</Text>
            <Text className='empty-sub'>点击右下角添加第一个纪念日吧~</Text>
          </View>
        ) : (
          <View className='anniversaries-container'>
            {sortedAnniversaries.map((anniversary) => {
              const typeInfo = getTypeInfo(anniversary.type)
              return (
                <CountdownCard
                  key={anniversary.id}
                  anniversary={anniversary}
                  emoji={typeInfo.emoji}
                  label={typeInfo.label}
                  onEdit={() => handleEditAnniversary(anniversary)}
                  onDelete={() => handleDeleteAnniversary(anniversary.id)}
                />
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* 创建按钮 */}
      <Button
        className='create-button'
        onClick={() => setShowCreateModal(true)}
      >
        <Text className='button-text'>+ 添加纪念日</Text>
      </Button>

      {/* 创建弹窗 */}
      {showCreateModal && (
        <CreateAnniversaryModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAnniversary}
        />
      )}
    </View>
  )
}
