import { View, Text, Input, Textarea, Image, Picker } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import Card from '../../components/Card'
import Button from '../../components/Button'
import './add-meal.scss'

// 餐食类型
const MEAL_TYPES = [
  { value: 'restaurant', label: '🍽️ 餐厅' },
  { value: 'homemade', label: '🍳 家常菜' },
  { value: 'takeout', label: '🥡 外卖' },
]

// 菜系分类
const CATEGORIES = [
  { value: 'chinese', label: '🥢 中餐' },
  { value: 'western', label: '🍴 西餐' },
  { value: 'japanese', label: '🍱 日料' },
  { value: 'korean', label: '🍜 韩料' },
  { value: 'fastfood', label: '🍔 快餐' },
  { value: 'dessert', label: '🍰 甜品' },
  { value: 'other', label: '🍽️ 其他' },
]

export default function AddMeal() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'restaurant',
    category: 'chinese',
    description: '',
    price: '',
    location: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Taro.showToast({
        title: '请输入餐食名称',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      await Taro.request({
        url: '/api/eating/meals',
        method: 'POST',
        data: {
          ...formData,
          price: formData.price ? parseFloat(formData.price) : undefined,
        },
      })

      Taro.showToast({
        title: '添加成功',
        icon: 'success',
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1000)
    } catch (error) {
      Taro.showToast({
        title: '添加失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="add-meal-page">
      <View className="page-header">
        <Text className="header-title">🍽️ 添加餐食</Text>
        <Text className="header-subtitle">记录你们喜欢的美味</Text>
      </View>

      <View className="form-content">
        <Card>
          <View className="form-item">
            <Text className="form-label">名称 *</Text>
            <Input
              className="form-input"
              placeholder="请输入餐食名称"
              value={formData.name}
              onInput={(e) => setFormData(prev => ({ ...prev, name: e.detail.value }))}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">类型</Text>
            <Picker
              mode="selector"
              range={MEAL_TYPES}
              rangeKey="label"
              value={MEAL_TYPES.findIndex(t => t.value === formData.type)}
              onChange={(e) => {
                const index = e.detail.value
                setFormData(prev => ({ ...prev, type: MEAL_TYPES[index].value }))
              }}
            >
              <View className="form-picker">
                <Text>{MEAL_TYPES.find(t => t.value === formData.type)?.label}</Text>
              </View>
            </Picker>
          </View>

          <View className="form-item">
            <Text className="form-label">分类</Text>
            <Picker
              mode="selector"
              range={CATEGORIES}
              rangeKey="label"
              value={CATEGORIES.findIndex(c => c.value === formData.category)}
              onChange={(e) => {
                const index = e.detail.value
                setFormData(prev => ({ ...prev, category: CATEGORIES[index].value }))
              }}
            >
              <View className="form-picker">
                <Text>{CATEGORIES.find(c => c.value === formData.category)?.label}</Text>
              </View>
            </Picker>
          </View>

          <View className="form-item">
            <Text className="form-label">人均价格</Text>
            <Input
              className="form-input"
              type="digit"
              placeholder="请输入人均价格"
              value={formData.price}
              onInput={(e) => setFormData(prev => ({ ...prev, price: e.detail.value }))}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">地址/位置</Text>
            <Input
              className="form-input"
              placeholder="餐厅地址或位置描述"
              value={formData.location}
              onInput={(e) => setFormData(prev => ({ ...prev, location: e.detail.value }))}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">描述</Text>
            <Textarea
              className="form-textarea"
              placeholder="描述一下这道美食..."
              value={formData.description}
              onInput={(e) => setFormData(prev => ({ ...prev, description: e.detail.value }))}
              maxlength={200}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">标签</Text>
            <View className="tag-input-wrapper">
              <Input
                className="tag-input"
                placeholder="输入标签后点击添加"
                value={tagInput}
                onInput={(e) => setTagInput(e.detail.value)}
              />
              <Button size="small" onClick={handleAddTag}>添加</Button>
            </View>
            <View className="tags-list">
              {formData.tags.map(tag => (
                <View key={tag} className="tag-item">
                  <Text>{tag}</Text>
                  <Text className="tag-remove" onClick={() => handleRemoveTag(tag)}>×</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <View className="submit-section">
          <Button
            type="primary"
            size="large"
            className="submit-btn"
            onClick={handleSubmit}
            loading={loading}
          >
            保存
          </Button>
        </View>
      </View>
    </View>
  )
}
