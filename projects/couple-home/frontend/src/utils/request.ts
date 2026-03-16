import Taro from '@tarojs/taro'

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

/**
 * 封装 Taro.request
 */
export const request = async <T = any>(options: RequestOptions): Promise<T> => {
  const { url, method = 'GET', data, header = {} } = options

  // 获取 token
  const token = Taro.getStorageSync('token')

  const response = await Taro.request({
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...header,
    },
  })

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data
  } else {
    throw new Error(`Request failed with status ${response.statusCode}`)
  }
}

/**
 * 上传图片
 */
export const uploadImages = async (filePath: string, folder: string = 'moments'): Promise<string | null> => {
  try {
    const token = Taro.getStorageSync('token')
    
    const res = await Taro.uploadFile({
      url: `${BASE_URL}/moments/upload`,
      filePath,
      name: 'images',
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      formData: {
        folder,
      },
    })

    if (res.statusCode === 201 || res.statusCode === 200) {
      const data = JSON.parse(res.data)
      // 返回图片 URL
      if (data.images && data.images.length > 0) {
        return data.images[0]
      }
      return res.data
    } else {
      Taro.showToast({ title: '上传失败', icon: 'none' })
      return null
    }
  } catch (error) {
    console.error('上传失败', error)
    Taro.showToast({ title: '上传失败', icon: 'none' })
    return null
  }
}

/**
 * 下载文件
 */
export const downloadFile = async (url: string): Promise<string | null> => {
  try {
    const res = await Taro.downloadFile({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    })

    if (res.statusCode === 200) {
      return res.tempFilePath
    } else {
      Taro.showToast({ title: '下载失败', icon: 'none' })
      return null
    }
  } catch (error) {
    console.error('下载失败', error)
    return null
  }
}

export default request
