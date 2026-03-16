import { View, Text, Input, Textarea, Picker } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import Card from '../../components/Card'
import Button from '../../components/Button'
import './add-recipe.scss'

// 难度选项
const DIFFICULTIES = [
  { value: 'easy', label: '🟢 简单' },
  { value: 'medium', label: '🟡 中等' },
  { value: 'hard', label: '🔴 困难' },
]

export default function AddRecipe() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [] as string[],
    steps: [] as string[],
    difficulty: 'medium',
    cookTime: '',
    servings: '2',
    tags: [] as string[],
  })
  const [ingredientInput, setIngredientInput] = useState('')
  const [stepInput, setStepInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()],
      }))
      setIngredientInput('')
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const handleAddStep = () => {
    if (stepInput.trim()) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, stepInput.trim()],
      }))
      setStepInput('')
    }
  }

  const handleRemoveStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
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
        title: '请输入食谱名称',
        icon: 'none',
      })
      return
    }

    if (formData.ingredients.length === 0) {
      Taro.showToast({
        title: '请至少添加一个食材',
        icon: 'none',
      })
      return
    }

    if (formData.steps.length === 0) {
      Taro.showToast({
        title: '请至少添加一个步骤',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    try {
      await Taro.request({
        url: '/api/eating/recipes',
        method: 'POST',
        data: {
          ...formData,
          cookTime: formData.cookTime ? parseInt(formData.cookTime) : undefined,
          servings: formData.servings ? parseInt(formData.servings) : 2,
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
    <View className="add-recipe-page">
      <View className="page-header">
        <Text className="header-title">📖 添加食谱</Text>
        <Text className="header-subtitle">收藏你们的美味食谱</Text>
      </View>

      <View className="form-content">
        <Card>
          <View className="form-item">
            <Text className="form-label">食谱名称 *</Text>
            <Input
              className="form-input"
              placeholder="请输入食谱名称"
              value={formData.name}
              onInput={(e) => setFormData(prev => ({ ...prev, name: e.detail.value }))}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">简介</Text>
            <Textarea
              className="form-textarea"
              placeholder="简单描述这道菜..."
              value={formData.description}
              onInput={(e) => setFormData(prev => ({ ...prev, description: e.detail.value }))}
              maxlength={200}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">难度</Text>
            <Picker
              mode="selector"
              range={DIFFICULTIES}
              rangeKey="label"
              value={DIFFICULTIES.findIndex(d => d.value === formData.difficulty)}
              onChange={(e) => {
                const index = e.detail.value
                setFormData(prev => ({ ...prev, difficulty: DIFFICULTIES[index].value }))
              }}
            >
              <View className="form-picker">
                <Text>{DIFFICULTIES.find(d => d.value === formData.difficulty)?.label}</Text>
              </View>
            </Picker>
          </View>

          <View className="form-item">
            <Text className="form-label">烹饪时间 (分钟)</Text>
            <Input
              className="form-input"
              type="digit"
              placeholder="请输入烹饪时间"
              value={formData.cookTime}
              onInput={(e) => setFormData(prev => ({ ...prev, cookTime: e.detail.value }))}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">几人份</Text>
            <Input
              className="form-input"
              type="digit"
              placeholder="请输入几人份"
              value={formData.servings}
              onInput={(e) => setFormData(prev => ({ ...prev, servings: e.detail.value }))}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">食材清单 *</Text>
            <View className="input-group">
              <Input
                className="input-field"
                placeholder="输入食材，如：西红柿 500g"
                value={ingredientInput}
                onInput={(e) => setIngredientInput(e.detail.value)}
              />
              <Button size="small" onClick={handleAddIngredient}>添加</Button>
            </View>
            <View className="list-items">
              {formData.ingredients.map((item, index) => (
                <View key={index} className="list-item">
                  <Text className="item-number">{index + 1}.</Text>
                  <Text className="item-text">{item}</Text>
                  <Text className="item-remove" onClick={() => handleRemoveIngredient(index)}>×</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="form-item">
            <Text className="form-label">烹饪步骤 *</Text>
            <View className="input-group">
              <Input
                className="input-field"
                placeholder="输入步骤说明"
                value={stepInput}
                onInput={(e) => setStepInput(e.detail.value)}
              />
              <Button size="small" onClick={handleAddStep}>添加</Button>
            </View>
            <View className="list-items">
              {formData.steps.map((step, index) => (
                <View key={index} className="list-item">
                  <Text className="item-number">{index + 1}.</Text>
                  <Text className="item-text">{step}</Text>
                  <Text className="item-remove" onClick={() => handleRemoveStep(index)}>×</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="form-item">
            <Text className="form-label">标签</Text>
            <View className="tag-input-group">
              <Input
                className="input-field"
                placeholder="输入标签"
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
            保存食谱
          </Button>
        </View>
      </View>
    </View>
  )
}
