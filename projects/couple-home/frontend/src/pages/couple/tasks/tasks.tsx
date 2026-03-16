import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { theme } from '../../../styles/theme'
import { Button } from '../../../components'
import './tasks.scss'

// 任务类型配置
const taskTypeConfig = {
  daily: { label: '每日', emoji: '🌅', color: '#FF8FA3' },
  weekly: { label: '每周', emoji: '📅', color: '#FFA07A' },
  monthly: { label: '每月', emoji: '🌙', color: '#DDA0DD' },
  custom: { label: '自定义', emoji: '✨', color: '#98FB98' },
}

// 优先级配置
const priorityConfig = {
  low: { label: '轻松', emoji: '💤', color: '#98FB98' },
  medium: { label: '普通', emoji: '😊', color: '#FFA07A' },
  high: { label: '重要', emoji: '🔥', color: '#FF6B81' },
}

interface Task {
  id: string
  title: string
  description?: string
  type: string
  frequency: number
  isCompleted: boolean
  completedAt?: string
  assigneeId?: string
  assignee?: {
    id: string
    username: string
    avatar?: string
  }
  priority: string
  icon?: string
  rotationOrder: number
  createdAt: string
  updatedAt: string
}

interface TaskStats {
  overview: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    completionRate: number
  }
  byUser: Array<{
    userId: string
    username: string
    avatar?: string
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    completionRate: number
  }>
  byType: {
    daily: number
    weekly: number
    monthly: number
    custom: number
  }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  // 获取当前用户和情侣信息（从 storage 获取）
  const getCurrentUser = () => {
    const userInfo = Taro.getStorageSync('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  }

  const getCoupleId = () => {
    const userInfo = getCurrentUser()
    return userInfo?.coupleId || ''
  }

  // 加载任务列表
  const loadTasks = async () => {
    try {
      setLoading(true)
      const coupleId = getCoupleId()
      const token = Taro.getStorageSync('token')
      
      const res = await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks`,
        method: 'GET',
        data: { coupleId },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      setTasks(res.data || [])
      
      // 同时加载统计数据
      await loadStats()
    } catch (error) {
      console.error('加载任务失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const coupleId = getCoupleId()
      const token = Taro.getStorageSync('token')
      
      const res = await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks/stats`,
        method: 'GET',
        data: { coupleId },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      setStats(res.data)
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // 创建任务
  const handleCreateTask = async (taskData: any) => {
    try {
      const coupleId = getCoupleId()
      const token = Taro.getStorageSync('token')
      
      await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks`,
        method: 'POST',
        data: { ...taskData, coupleId },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      Taro.showToast({
        title: '创建成功 💕',
        icon: 'success',
      })
      
      setShowAddModal(false)
      loadTasks()
    } catch (error) {
      console.error('创建任务失败:', error)
      Taro.showToast({
        title: '创建失败',
        icon: 'error',
      })
    }
  }

  // 分配任务
  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const token = Taro.getStorageSync('token')
      
      await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks/${taskId}/assign`,
        method: 'POST',
        data: { userId },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      Taro.showToast({
        title: '分配成功 🎉',
        icon: 'success',
      })
      
      loadTasks()
    } catch (error) {
      console.error('分配任务失败:', error)
      Taro.showToast({
        title: '分配失败',
        icon: 'error',
      })
    }
  }

  // 完成任务打卡
  const handleCompleteTask = async (taskId: string) => {
    try {
      const userInfo = getCurrentUser()
      const token = Taro.getStorageSync('token')
      
      await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks/${taskId}/complete`,
        method: 'POST',
        data: {},
        query: { userId: userInfo.id },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      Taro.showToast({
        title: '完成打卡 ✨',
        icon: 'success',
      })
      
      loadTasks()
    } catch (error) {
      console.error('完成任务失败:', error)
      Taro.showToast({
        title: '打卡失败',
        icon: 'error',
      })
    }
  }

  // 取消完成
  const handleUncompleteTask = async (taskId: string) => {
    try {
      const token = Taro.getStorageSync('token')
      
      await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks/${taskId}/uncomplete`,
        method: 'POST',
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      Taro.showToast({
        title: '已取消',
        icon: 'success',
      })
      
      loadTasks()
    } catch (error) {
      console.error('取消完成失败:', error)
    }
  }

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const token = Taro.getStorageSync('token')
            
            await Taro.request({
              url: `${process.env.API_BASE_URL}/tasks/${taskId}`,
              method: 'DELETE',
              header: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
            })
            
            loadTasks()
          } catch (error) {
            console.error('删除任务失败:', error)
            Taro.showToast({
              title: '删除失败',
              icon: 'error',
            })
          }
        }
      },
    })
  }

  // 自动轮值分配
  const handleAutoAssign = async () => {
    try {
      const coupleId = getCoupleId()
      const token = Taro.getStorageSync('token')
      
      await Taro.request({
        url: `${process.env.API_BASE_URL}/tasks/auto-assign`,
        method: 'POST',
        data: { coupleId },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      Taro.showToast({
        title: '自动分配完成 🎊',
        icon: 'success',
      })
      
      loadTasks()
    } catch (error) {
      console.error('自动分配失败:', error)
      Taro.showToast({
        title: '分配失败',
        icon: 'error',
      })
    }
  }

  // 过滤任务
  const filteredTasks = filterType === 'all' 
    ? tasks 
    : tasks.filter(task => task.type === filterType)

  const currentUser = getCurrentUser()

  return (
    <View className='tasks-page'>
      {/* 头部 */}
      <View className='header'>
        <View className='header-top'>
          <Text className='title'>🧹 家务分工</Text>
          <View className='header-actions'>
            <View 
              className='action-btn stats-btn'
              onClick={() => setShowStats(!showStats)}
            >
              📊
            </View>
            <View 
              className='action-btn add-btn'
              onClick={() => setShowAddModal(true)}
            >
              ➕
            </View>
          </View>
        </View>
        
        {/* 统计概览 */}
        {stats && showStats && (
          <View className='stats-overview'>
            <View className='stats-card'>
              <Text className='stats-value'>{stats.overview.totalTasks}</Text>
              <Text className='stats-label'>总任务</Text>
            </View>
            <View className='stats-card'>
              <Text className='stats-value'>{stats.overview.completedTasks}</Text>
              <Text className='stats-label'>已完成</Text>
            </View>
            <View className='stats-card'>
              <Text className='stats-value'>{stats.overview.pendingTasks}</Text>
              <Text className='stats-label'>待完成</Text>
            </View>
            <View className='stats-card'>
              <Text className='stats-value'>{stats.overview.completionRate}%</Text>
              <Text className='stats-label'>完成率</Text>
            </View>
          </View>
        )}
        
        {/* 用户统计 */}
        {stats && showStats && (
          <View className='user-stats'>
            <Text className='section-title'>💕 家务统计</Text>
            {stats.byUser.map(user => (
              <View key={user.userId} className='user-stat-card'>
                <View className='user-info'>
                  {user.avatar ? (
                    <Image className='user-avatar' src={user.avatar} mode='aspectFill' />
                  ) : (
                    <View className='user-avatar-placeholder'>
                      {user.username.charAt(0)}
                    </View>
                  )}
                  <Text className='user-name'>{user.username}</Text>
                </View>
                <View className='user-progress'>
                  <View className='progress-bar'>
                    <View 
                      className='progress-fill' 
                      style={{ width: `${user.completionRate}%` }}
                    />
                  </View>
                  <View className='user-stats-detail'>
                    <Text className='stat-item'>✅ {user.completedTasks}</Text>
                    <Text className='stat-item'>⏳ {user.pendingTasks}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 筛选标签 */}
      <View className='filter-tabs'>
        <View 
          className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          全部
        </View>
        {Object.entries(taskTypeConfig).map(([key, config]) => (
          <View 
            key={key}
            className={`filter-tab ${filterType === key ? 'active' : ''}`}
            onClick={() => setFilterType(key)}
            style={filterType === key ? { backgroundColor: config.color } : {}}
          >
            {config.emoji} {config.label}
          </View>
        ))}
      </View>

      {/* 操作按钮 */}
      <View className='action-bar'>
        <Button 
          className='auto-assign-btn'
          onClick={handleAutoAssign}
        >
          🎲 自动分配
        </Button>
      </View>

      {/* 任务列表 */}
      <ScrollView className='task-list' scrollY>
        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-emoji'>🧹</Text>
            <Text className='empty-text'>还没有任务哦~</Text>
            <Text className='empty-hint'>点击右上角 ➕ 添加第一个任务吧!</Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <View 
              key={task.id} 
              className={`task-item ${task.isCompleted ? 'completed' : ''}`}
            >
              {/* 完成按钮 */}
              <View 
                className={`checkbox ${task.isCompleted ? 'checked' : ''}`}
                onClick={() => task.isCompleted ? handleUncompleteTask(task.id) : handleCompleteTask(task.id)}
              >
                {task.isCompleted && <Text className='checkmark'>✓</Text>}
              </View>
              
              {/* 任务信息 */}
              <View className='task-info'>
                <View className='task-header'>
                  <Text className='task-icon'>{task.icon || taskTypeConfig[task.type]?.emoji || '🧹'}</Text>
                  <Text className='task-title'>{task.title}</Text>
                </View>
                
                {task.description && (
                  <Text className='task-desc'>{task.description}</Text>
                )}
                
                <View className='task-meta'>
                  <View className='task-type' style={{ backgroundColor: taskTypeConfig[task.type]?.color }}>
                    {taskTypeConfig[task.type]?.emoji} {taskTypeConfig[task.type]?.label}
                  </View>
                  <View className='task-priority' style={{ backgroundColor: priorityConfig[task.priority]?.color }}>
                    {priorityConfig[task.priority]?.emoji}
                  </View>
                </View>
                
                {/* 分配信息 */}
                {task.assignee ? (
                  <View className='assignee-info'>
                    <Text className='assignee-label'>👤 负责人:</Text>
                    <Text className='assignee-name'>{task.assignee.username}</Text>
                  </View>
                ) : (
                  <View className='assignee-info unassigned'>
                    <Text className='assignee-label'>⚠️ 未分配</Text>
                  </View>
                )}
              </View>
              
              {/* 操作按钮 */}
              <View className='task-actions'>
                {!task.assignee && (
                  <View 
                    className='action-icon assign'
                    onClick={() => handleAssignTask(task.id, currentUser?.id)}
                  >
                    📍
                  </View>
                )}
                <View 
                  className='action-icon delete'
                  onClick={() => handleDeleteTask(task.id)}
                >
                  🗑️
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 添加任务弹窗 */}
      {showAddModal && (
        <AddTaskModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </View>
  )
}

// 添加任务弹窗组件
function AddTaskModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    frequency: 1,
    priority: 'medium',
    icon: '🧹',
  })

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({
        title: '请输入任务标题',
        icon: 'none',
      })
      return
    }
    
    onSubmit(formData)
  }

  return (
    <View className='modal-overlay'>
      <View className='modal-content'>
        <View className='modal-header'>
          <Text className='modal-title'>✨ 新增任务</Text>
          <View className='modal-close' onClick={onClose}>✕</View>
        </View>
        
        <View className='modal-body'>
          <View className='form-group'>
            <Text className='form-label'>任务标题 *</Text>
            <input
              className='form-input'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder='例如：洗碗、倒垃圾...'
            />
          </View>
          
          <View className='form-group'>
            <Text className='form-label'>任务描述</Text>
            <textarea
              className='form-textarea'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder='可选描述...'
            />
          </View>
          
          <View className='form-group'>
            <Text className='form-label'>任务类型</Text>
            <View className='type-selector'>
              {Object.entries(taskTypeConfig).map(([key, config]) => (
                <View
                  key={key}
                  className={`type-option ${formData.type === key ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, type: key })}
                  style={formData.type === key ? { backgroundColor: config.color } : {}}
                >
                  {config.emoji} {config.label}
                </View>
              ))}
            </View>
          </View>
          
          <View className='form-group'>
            <Text className='form-label'>优先级</Text>
            <View className='priority-selector'>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <View
                  key={key}
                  className={`priority-option ${formData.priority === key ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, priority: key })}
                  style={formData.priority === key ? { backgroundColor: config.color } : {}}
                >
                  {config.emoji} {config.label}
                </View>
              ))}
            </View>
          </View>
          
          <View className='form-group'>
            <Text className='form-label'>图标 Emoji</Text>
            <input
              className='form-input'
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder='🧹'
            />
          </View>
        </View>
        
        <View className='modal-footer'>
          <Button className='cancel-btn' onClick={onClose}>取消</Button>
          <Button className='submit-btn' onClick={handleSubmit}>创建 💕</Button>
        </View>
      </View>
    </View>
  )
}
