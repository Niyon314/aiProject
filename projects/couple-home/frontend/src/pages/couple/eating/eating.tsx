import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import Card from '../../components/Card'
import Button from '../../components/Button'
import './eating.scss'

// 🍽️ 餐食类型配置
const MEAL_TYPES = [
  { value: 'restaurant', label: '🍽️ 餐厅', color: '#FF6B81' },
  { value: 'homemade', label: '🍳 家常菜', color: '#FFA502' },
  { value: 'takeout', label: '🥡 外卖', color: '#1E90FF' },
]

// 🎯 决策助手选项
const DECISION_HELPERS = [
  { value: 'random', label: '🎲 帮我选', desc: '随机推荐' },
  { value: 'vote', label: '🗳️ 投票决定', desc: '一起投票' },
  { value: 'rotate', label: '🔄 轮流决定', desc: '今天你选/明天我选' },
]

interface Meal {
  id: string
  name: string
  type: string
  category?: string
  description?: string
  imageUrl?: string
  price?: number
  location?: string
  rating?: number
  tags: string[]
  isFavorite: boolean
  viewCount: number
  lastEatenAt?: string
}

interface Recipe {
  id: string
  name: string
  description?: string
  ingredients: string[]
  steps: string[]
  difficulty: string
  cookTime?: number
  servings: number
  imageUrl?: string
  tags: string[]
  isFavorite: boolean
  cookCount: number
}

interface ShoppingItem {
  id: string
  name: string
  category: string
  quantity?: string
  price?: number
  priority: string
  isChecked: boolean
  checkedAt?: string
  note?: string
}

interface CookingSchedule {
  id: string
  date: string
  cook: {
    id: string
    username: string
    avatar?: string
  }
  mealType: string
  mealName?: string
  isCompleted: boolean
  rating?: number
}

export default function Eating() {
  const [activeTab, setActiveTab] = useState<'today' | 'vote' | 'schedule' | 'recipes' | 'shopping'>('today')
  const [meals, setMeals] = useState<Meal[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [schedule, setSchedule] = useState<CookingSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [randomMeal, setRandomMeal] = useState<Meal | null>(null)
  const [showRandomAnimation, setShowRandomAnimation] = useState(false)
  const [vetoAvailable, setVetoAvailable] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 加载餐食
      const mealsRes = await Taro.request({
        url: '/api/eating/meals',
        method: 'GET',
      })
      setMeals(mealsRes.data as Meal[])

      // 加载食谱
      const recipesRes = await Taro.request({
        url: '/api/eating/recipes',
        method: 'GET',
      })
      setRecipes(recipesRes.data as Recipe[])

      // 加载购物清单
      const shoppingRes = await Taro.request({
        url: '/api/eating/shopping-list',
        method: 'GET',
      })
      setShoppingList(shoppingRes.data as ShoppingItem[])

      // 加载今日排班
      const scheduleRes = await Taro.request({
        url: '/api/eating/schedule/today',
        method: 'GET',
      })
      setSchedule(scheduleRes.data as CookingSchedule[])
    } catch (error) {
      console.error('加载数据失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 🎲 随机推荐
  const handleRandomMeal = async () => {
    setShowRandomAnimation(true)
    setLoading(true)
    
    try {
      const res = await Taro.request({
        url: '/api/eating/random',
        method: 'GET',
      })
      setRandomMeal(res.data as Meal)
      
      Taro.showToast({
        title: `🎉 就吃这个！`,
        icon: 'success',
      })
    } catch (error) {
      Taro.showToast({
        title: '没有可选的餐食',
        icon: 'none',
      })
    } finally {
      setLoading(false)
      setTimeout(() => setShowRandomAnimation(false), 1000)
    }
  }

  // 🗳️ 投票
  const handleVote = async (mealId: string, voteType: 'like' | 'dislike' | 'veto') => {
    try {
      if (voteType === 'veto' && !vetoAvailable) {
        Taro.showToast({
          title: '今天的否决权已用完',
          icon: 'none',
        })
        return
      }

      await Taro.request({
        url: '/api/eating/votes',
        method: 'POST',
        data: {
          mealId,
          voteType,
        },
      })

      if (voteType === 'veto') {
        setVetoAvailable(false)
      }

      Taro.showToast({
        title: voteType === 'like' ? '👍 喜欢' : voteType === 'dislike' ? '👎 不喜欢' : '❌ 已否决',
        icon: 'success',
      })
    } catch (error) {
      Taro.showToast({
        title: '投票失败',
        icon: 'none',
      })
    }
  }

  // 🛒 切换购物项状态
  const toggleShoppingItem = async (item: ShoppingItem) => {
    try {
      await Taro.request({
        url: `/api/eating/shopping-list/${item.id}`,
        method: 'PUT',
        data: {
          isChecked: !item.isChecked,
        },
      })

      setShoppingList(prev =>
        prev.map(i =>
          i.id === item.id ? { ...i, isChecked: !i.isChecked } : i
        )
      )

      Taro.showToast({
        title: item.isChecked ? '取消购买' : '✅ 已购买',
        icon: 'success',
      })
    } catch (error) {
      Taro.showToast({
        title: '操作失败',
        icon: 'none',
      })
    }
  }

  // 📝 添加购物项
  const handleAddShoppingItem = () => {
    Taro.showModal({
      title: '添加购物项',
      editable: true,
      placeholderText: '输入要买的物品',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await Taro.request({
              url: '/api/eating/shopping-list',
              method: 'POST',
              data: {
                name: res.content,
                category: 'other',
                priority: 'normal',
              },
            })
            loadData()
            Taro.showToast({
              title: '添加成功',
              icon: 'success',
            })
          } catch (error) {
            Taro.showToast({
              title: '添加失败',
              icon: 'none',
            })
          }
        }
      },
    })
  }

  // 🍳 标记食谱为做过
  const handleMarkCooked = async (recipeId: string) => {
    try {
      await Taro.request({
        url: `/api/eating/recipes/${recipeId}/cooked`,
        method: 'POST',
      })

      setRecipes(prev =>
        prev.map(r =>
          r.id === recipeId ? { ...r, cookCount: r.cookCount + 1 } : r
        )
      )

      Taro.showToast({
        title: '🎉 又学会一道菜！',
        icon: 'success',
      })
    } catch (error) {
      Taro.showToast({
        title: '操作失败',
        icon: 'none',
      })
    }
  }

  // 渲染 Tab
  const renderTab = (id: typeof activeTab, label: string, icon: string) => (
    <View
      className={`eating-tab ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Text className="tab-icon">{icon}</Text>
      <Text className="tab-label">{label}</Text>
    </View>
  )

  return (
    <View className="eating-page">
      {/* 头部 */}
      <View className="eating-header">
        <Text className="header-title">🍽️ 今天吃什么</Text>
        <Text className="header-subtitle">一起决定美味时光</Text>
      </View>

      {/* Tab 导航 */}
      <View className="eating-tabs">
        {renderTab('today', '今日', '🎲')}
        {renderTab('vote', '投票', '🗳️')}
        {renderTab('schedule', '排班', '📅')}
        {renderTab('recipes', '食谱', '📖')}
        {renderTab('shopping', '购物', '🛒')}
      </View>

      <ScrollView className="eating-content" scrollY>
        {loading && (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        )}

        {/* 今日吃什么 */}
        {activeTab === 'today' && (
          <View className="today-section">
            {/* 决策助手 */}
            <Card className="decision-helper">
              <Text className="section-title">🎯 决策助手</Text>
              <View className="helper-buttons">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleRandomMeal}
                  className="random-btn"
                >
                  🎲 帮我选
                </Button>
              </View>
              {!vetoAvailable && (
                <Text className="veto-hint">❌ 今日否决权已用完</Text>
              )}
            </Card>

            {/* 随机推荐结果 */}
            {randomMeal && (
              <Card className="random-result">
                <View className="meal-card">
                  {randomMeal.imageUrl && (
                    <Image
                      className="meal-image"
                      src={randomMeal.imageUrl}
                      mode="aspectFill"
                    />
                  )}
                  <View className="meal-info">
                    <Text className="meal-name">{randomMeal.name}</Text>
                    <View className="meal-tags">
                      {randomMeal.tags.map(tag => (
                        <Text key={tag} className="tag">{tag}</Text>
                      ))}
                    </View>
                    <View className="meal-actions">
                      <Button
                        size="small"
                        onClick={() => handleVote(randomMeal.id, 'like')}
                      >
                        👍 想吃
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleVote(randomMeal.id, 'dislike')}
                      >
                        👎 不想
                      </Button>
                      {vetoAvailable && (
                        <Button
                          size="small"
                          type="warn"
                          onClick={() => handleVote(randomMeal.id, 'veto')}
                        >
                          ❌ 否决
                        </Button>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            )}

            {/* 餐食列表 */}
            <Card className="meals-list">
              <Text className="section-title">🍽️ 备选餐食</Text>
              {meals.length === 0 ? (
                <View className="empty-state">
                  <Text>还没有餐食，快去添加吧~</Text>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => Taro.navigateTo({ url: '/pages/couple/eating/add-meal' })}
                  >
                    + 添加餐食
                  </Button>
                </View>
              ) : (
                meals.map(meal => (
                  <View key={meal.id} className="meal-item">
                    <Text className="meal-item-name">{meal.name}</Text>
                    <View className="meal-item-tags">
                      {meal.tags.slice(0, 3).map(tag => (
                        <Text key={tag} className="tag-small">{tag}</Text>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>
        )}

        {/* 投票 */}
        {activeTab === 'vote' && (
          <View className="vote-section">
            <Card>
              <Text className="section-title">🗳️ 点餐投票</Text>
              <Text className="section-hint">各自投票，系统自动匹配双方都喜欢的</Text>
              {meals.map(meal => (
                <View key={meal.id} className="vote-item">
                  <Text className="vote-meal-name">{meal.name}</Text>
                  <View className="vote-actions">
                    <Button
                      size="small"
                      onClick={() => handleVote(meal.id, 'like')}
                    >
                      👍
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleVote(meal.id, 'dislike')}
                    >
                      👎
                    </Button>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* 做饭排班 */}
        {activeTab === 'schedule' && (
          <View className="schedule-section">
            <Card>
              <Text className="section-title">📅 今日做饭安排</Text>
              {schedule.length === 0 ? (
                <Text className="empty-hint">今天还没有排班哦~</Text>
              ) : (
                schedule.map(item => (
                  <View key={item.id} className="schedule-item">
                    <Text className="schedule-meal-type">
                      {item.mealType === 'breakfast' ? '🌅 早餐' :
                       item.mealType === 'lunch' ? '☀️ 午餐' : '🌙 晚餐'}
                    </Text>
                    <View className="schedule-cook">
                      {item.cook.avatar && (
                        <Image
                          className="cook-avatar"
                          src={item.cook.avatar}
                          mode="aspectFill"
                        />
                      )}
                      <Text className="cook-name">{item.cook.username}</Text>
                    </View>
                    {item.mealName && (
                      <Text className="schedule-meal-name">{item.mealName}</Text>
                    )}
                  </View>
                ))
              )}
            </Card>
          </View>
        )}

        {/* 食谱收藏 */}
        {activeTab === 'recipes' && (
          <View className="recipes-section">
            <Card>
              <Text className="section-title">📖 我的收藏食谱</Text>
              <Button
                type="primary"
                size="small"
                className="add-recipe-btn"
                onClick={() => Taro.navigateTo({ url: '/pages/couple/eating/add-recipe' })}
              >
                + 添加食谱
              </Button>
            </Card>
            {recipes.map(recipe => (
              <Card key={recipe.id} className="recipe-card">
                {recipe.imageUrl && (
                  <Image
                    className="recipe-image"
                    src={recipe.imageUrl}
                    mode="aspectFill"
                  />
                )}
                <View className="recipe-info">
                  <Text className="recipe-name">{recipe.name}</Text>
                  <View className="recipe-meta">
                    <Text className="recipe-difficulty">
                      {recipe.difficulty === 'easy' ? '🟢 简单' :
                       recipe.difficulty === 'medium' ? '🟡 中等' : '🔴 困难'}
                    </Text>
                    {recipe.cookTime && (
                      <Text className="recipe-time">⏱️ {recipe.cookTime}分钟</Text>
                    )}
                    <Text className="recipe-cook-count">🍳 做过{recipe.cookCount}次</Text>
                  </View>
                  <View className="recipe-actions">
                    <Button
                      size="small"
                      onClick={() => Taro.navigateTo({
                        url: `/pages/couple/eating/recipe-detail?id=${recipe.id}`,
                      })}
                    >
                      查看详情
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleMarkCooked(recipe.id)}
                    >
                      ✅ 做过
                    </Button>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* 购物清单 */}
        {activeTab === 'shopping' && (
          <View className="shopping-section">
            <Card>
              <View className="shopping-header">
                <Text className="section-title">🛒 购物清单</Text>
                <Button
                  size="small"
                  type="primary"
                  onClick={handleAddShoppingItem}
                >
                  + 添加
                </Button>
              </View>
            </Card>
            {shoppingList.map(item => (
              <Card
                key={item.id}
                className={`shopping-item ${item.isChecked ? 'checked' : ''}`}
                onClick={() => toggleShoppingItem(item)}
              >
                <View className="shopping-checkbox">
                  <Text className={`checkbox-icon ${item.isChecked ? 'checked' : ''}`}>
                    {item.isChecked ? '✅' : '⬜'}
                  </Text>
                </View>
                <View className="shopping-info">
                  <Text className="shopping-name">{item.name}</Text>
                  {item.quantity && (
                    <Text className="shopping-quantity">{item.quantity}</Text>
                  )}
                  {item.note && (
                    <Text className="shopping-note">{item.note}</Text>
                  )}
                </View>
                <View className="shopping-priority">
                  {item.priority === 'urgent' && <Text className="priority-urgent">🔥 急</Text>}
                  {item.priority === 'high' && <Text className="priority-high">⬆️ 高</Text>}
                </View>
              </Card>
            ))}
            {shoppingList.length === 0 && (
              <Card className="empty-state">
                <Text>购物清单是空的~</Text>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
