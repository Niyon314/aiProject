import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { CreateMomentDto, UpdateMomentDto, QueryMomentDto } from '../dto/create-moment.dto'

@Injectable()
export class MomentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建瞬间
   */
  async create(createMomentDto: CreateMomentDto) {
    return this.prisma.moment.create({
      data: {
        ...createMomentDto,
        tags: createMomentDto.tags || [],
      },
      include: { user: true, couple: true },
    })
  }

  /**
   * 获取瞬间列表（支持分页、标签筛选）
   */
  async findAll(query: QueryMomentDto) {
    const { coupleId, userId, tag, page = 1, limit = 20, order = 'desc' } = query
    
    const where: any = {}
    
    if (coupleId) {
      where.coupleId = coupleId
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (tag) {
      where.tags = { has: tag }
    }

    const skip = (page - 1) * limit
    const orderBy = { createdAt: order }

    const [data, total] = await Promise.all([
      this.prisma.moment.findMany({
        where,
        include: { user: true, couple: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.moment.count({ where }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * 按情侣获取瞬间（时间线）
   */
  async findByCouple(coupleId: string, page = 1, limit = 20) {
    return this.findAll({ coupleId, page, limit })
  }

  /**
   * 按用户获取瞬间
   */
  async findByUser(userId: string, page = 1, limit = 20) {
    return this.findAll({ userId, page, limit })
  }

  /**
   * 按标签筛选
   */
  async findByTag(coupleId: string, tag: string, page = 1, limit = 20) {
    return this.findAll({ coupleId, tag, page, limit })
  }

  /**
   * 获取所有标签（用于筛选）
   */
  async getAllTags(coupleId?: string, userId?: string) {
    const where: any = {}
    
    if (coupleId) {
      where.coupleId = coupleId
    }
    
    if (userId) {
      where.userId = userId
    }

    const moments = await this.prisma.moment.findMany({
      where,
      select: { tags: true },
    })

    // 去重获取所有标签
    const tagSet = new Set<string>()
    moments.forEach(moment => {
      moment.tags.forEach(tag => tagSet.add(tag))
    })

    return Array.from(tagSet)
  }

  /**
   * 获取单个瞬间
   */
  async findOne(id: string) {
    const moment = await this.prisma.moment.findUnique({
      where: { id },
      include: { user: true, couple: true },
    })

    if (!moment) {
      throw new NotFoundException(`Moment with ID ${id} not found`)
    }

    return moment
  }

  /**
   * 更新瞬间
   */
  async update(id: string, updateMomentDto: UpdateMomentDto) {
    const data: any = { ...updateMomentDto }
    
    // 确保 tags 是数组
    if (updateMomentDto.tags) {
      data.tags = updateMomentDto.tags
    }

    return this.prisma.moment.update({
      where: { id },
      data,
      include: { user: true, couple: true },
    })
  }

  /**
   * 删除瞬间
   */
  async remove(id: string) {
    await this.findOne(id) // 验证存在
    
    return this.prisma.moment.delete({
      where: { id },
    })
  }

  /**
   * 点赞
   */
  async like(id: string) {
    await this.findOne(id) // 验证存在
    
    return this.prisma.moment.update({
      where: { id },
      data: { likes: { increment: 1 } },
    })
  }

  /**
   * 取消点赞
   */
  async unlike(id: string) {
    await this.findOne(id) // 验证存在
    
    return this.prisma.moment.update({
      where: { id },
      data: { likes: { decrement: 1 } },
    })
  }

  /**
   * 获取"去年的今天"回忆
   */
  async getMemories(userId: string, coupleId?: string) {
    const now = new Date()
    const lastYear = new Date()
    lastYear.setFullYear(now.getFullYear() - 1)

    // 获取前后 3 天的回忆
    const startDate = new Date(lastYear)
    startDate.setDate(lastYear.getDate() - 3)
    
    const endDate = new Date(lastYear)
    endDate.setDate(lastYear.getDate() + 3)

    const where: any = {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (coupleId) {
      where.coupleId = coupleId
    }

    return this.prisma.moment.findMany({
      where,
      include: { user: true, couple: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 获取时间线（按月分组）
   */
  async getTimeline(coupleId: string, year?: number, month?: number) {
    const where: any = { coupleId }

    if (year && month) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    } else if (year) {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31)
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    }

    const moments = await this.prisma.moment.findMany({
      where,
      include: { user: true, couple: true },
      orderBy: { createdAt: 'desc' },
    })

    // 按月份分组
    const timeline: any = {}
    moments.forEach(moment => {
      const date = new Date(moment.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!timeline[monthKey]) {
        timeline[monthKey] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          moments: [],
        }
      }
      
      timeline[monthKey].moments.push(moment)
    })

    return Object.values(timeline).sort((a: any, b: any) => {
      return new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime()
    })
  }
}
