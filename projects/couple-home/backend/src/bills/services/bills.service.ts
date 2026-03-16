import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateBillDto, UpdateBillDto, SplitMode, BillCategory } from './dto/create-bill.dto'

/**
 * 💰 账单服务
 * 处理账单 CRUD、AA 计算、统计等核心业务逻辑
 */
@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✨ 创建账单
   * 自动计算分摊金额并创建分摊记录
   */
  async create(createBillDto: CreateBillDto) {
    const { shares: inputShares, ...billData } = createBillDto
    
    // 获取情侣信息
    const couple = await this.prisma.couple.findUnique({
      where: { id: createBillDto.coupleId },
      include: { user1: true, user2: true },
    })

    if (!couple) {
      throw new NotFoundException('情侣关系不存在')
    }

    // 计算分摊金额
    const calculatedShares = this.calculateShares(createBillDto, couple)

    // 创建账单及分摊记录
    const bill = await this.prisma.bill.create({
      data: {
        ...billData,
        shares: {
          create: calculatedShares.map(share => ({
            userId: share.userId,
            amount: share.amount,
            isPaid: false,
          })),
        },
      },
      include: {
        paidByUser: true,
        shares: {
          include: { user: true },
        },
        couple: true,
      },
    })

    return bill
  }

  /**
   * 📝 更新账单
   */
  async update(id: string, updateBillDto: UpdateBillDto) {
    // 先获取原账单
    const existingBill = await this.prisma.bill.findUnique({
      where: { id },
      include: { couple: true },
    })

    if (!existingBill) {
      throw new NotFoundException('账单不存在')
    }

    // 如果金额或分摊模式改变，重新计算分摊
    if (updateBillDto.amount || updateBillDto.splitMode || updateBillDto.splitRatio !== undefined) {
      const updatedBillData = { ...existingBill, ...updateBillDto }
      const newShares = this.calculateShares(updatedBillData as any, existingBill.couple)

      // 更新分摊记录
      await this.prisma.billShare.deleteMany({
        where: { billId: id },
      })

      await this.prisma.billShare.createMany({
        data: newShares.map(share => ({
          billId: id,
          userId: share.userId,
          amount: share.amount,
          isPaid: false,
        })),
      })
    }

    // 更新账单
    return this.prisma.bill.update({
      where: { id },
      data: updateBillDto,
      include: {
        paidByUser: true,
        shares: { include: { user: true } },
      },
    })
  }

  /**
   * 🗑️ 删除账单
   */
  async remove(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
    })

    if (!bill) {
      throw new NotFoundException('账单不存在')
    }

    return this.prisma.bill.delete({
      where: { id },
      include: {
        paidByUser: true,
        shares: true,
      },
    })
  }

  /**
   * 📋 获取情侣账单列表
   */
  async findByCouple(coupleId: string, filters?: {
    startDate?: Date
    endDate?: Date
    category?: string
    month?: string
  }) {
    const where: any = { coupleId }

    // 日期筛选
    if (filters?.startDate || filters?.endDate) {
      where.billDate = {}
      if (filters.startDate) where.billDate.gte = filters.startDate
      if (filters.endDate) where.billDate.lte = filters.endDate
    }

    // 月份筛选
    if (filters?.month) {
      const [year, month] = filters.month.split('-')
      where.billDate = {
        ...where.billDate,
        gte: new Date(parseInt(year), parseInt(month) - 1, 1),
        lt: new Date(parseInt(year), parseInt(month), 1),
      }
    }

    // 分类筛选
    if (filters?.category) {
      where.category = filters.category
    }

    return this.prisma.bill.findMany({
      where,
      include: {
        paidByUser: true,
        shares: { 
          include: { 
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          } 
        },
      },
      orderBy: { billDate: 'desc' },
    })
  }

  /**
   * 📊 获取账单统计
   */
  async getStatistics(coupleId: string, filters?: {
    startDate?: Date
    endDate?: Date
    month?: string
  }) {
    const where: any = { coupleId }

    // 月份筛选
    if (filters?.month) {
      const [year, month] = filters.month.split('-')
      where.billDate = {
        gte: new Date(parseInt(year), parseInt(month) - 1, 1),
        lt: new Date(parseInt(year), parseInt(month), 1),
      }
    } else if (filters?.startDate || filters?.endDate) {
      where.billDate = {}
      if (filters.startDate) where.billDate.gte = filters.startDate
      if (filters.endDate) where.billDate.lte = filters.endDate
    }

    const bills = await this.prisma.bill.findMany({
      where,
      select: {
        amount: true,
        category: true,
        paidById: true,
        splitMode: true,
        emotionalNote: true,
      },
    })

    // 计算总额
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0)

    // 按分类统计
    const byCategory = bills.reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount
      return acc
    }, {} as Record<string, number>)

    // 按支付人统计
    const byPayer = bills.reduce((acc, bill) => {
      acc[bill.paidById] = (acc[bill.paidById] || 0) + bill.amount
      return acc
    }, {} as Record<string, number>)

    // 计算每人应付总额
    const couple = await this.prisma.couple.findUnique({
      where: { id: coupleId },
      include: { user1: true, user2: true },
    })

    let user1Total = 0
    let user2Total = 0

    for (const bill of bills) {
      const shares = await this.prisma.billShare.findMany({
        where: { billId: bill.id },
      })
      
      for (const share of shares) {
        if (share.userId === couple?.user1Id) {
          user1Total += share.amount
        } else if (share.userId === couple?.user2Id) {
          user2Total += share.amount
        }
      }
    }

    // 分类名称映射
    const categoryNames: Record<string, string> = {
      food: '🍔 餐饮',
      transport: '🚗 交通',
      housing: '🏠 居住',
      entertainment: '🎬 娱乐',
      shopping: '🛍️ 购物',
      medical: '💊 医疗',
      education: '📚 教育',
      other: '📦 其他',
    }

    return {
      totalAmount,
      count: bills.length,
      byCategory: Object.entries(byCategory).map(([key, value]) => ({
        category: key,
        categoryName: categoryNames[key] || key,
        amount: value,
      })),
      byPayer,
      user1Total,
      user2Total,
      user1Name: couple?.user1.username,
      user2Name: couple?.user2.username,
    }
  }

  /**
   * 💕 计算分摊金额
   */
  private calculateShares(
    billData: CreateBillDto & { splitMode?: SplitMode; splitRatio?: number },
    couple: any,
  ): { userId: string; amount: number }[] {
    const { amount, splitMode = SplitMode.EQUAL, splitRatio, paidById } = billData
    const shares: { userId: string; amount: number }[] = []

    // 如果是"这次我请"模式，只有支付人承担
    if (splitMode === SplitMode.GIFT) {
      return [{ userId: paidById, amount }]
    }

    // 平均 AA 模式
    if (splitMode === SplitMode.EQUAL) {
      const splitAmount = amount / 2
      shares.push({ userId: couple.user1Id, amount: splitAmount })
      shares.push({ userId: couple.user2Id, amount: splitAmount })
      return shares
    }

    // 按比例模式
    if (splitMode === SplitMode.RATIO && splitRatio !== undefined) {
      const user1Amount = amount * splitRatio
      const user2Amount = amount * (1 - splitRatio)
      shares.push({ userId: couple.user1Id, amount: user1Amount })
      shares.push({ userId: couple.user2Id, amount: user2Amount })
      return shares
    }

    // 自定义模式（使用传入的 shares）
    if (splitMode === SplitMode.CUSTOM && billData.shares) {
      return billData.shares.map(share => ({
        userId: share.userId,
        amount: share.amount,
      }))
    }

    // 默认 AA
    const splitAmount = amount / 2
    shares.push({ userId: couple.user1Id, amount: splitAmount })
    shares.push({ userId: couple.user2Id, amount: splitAmount })
    return shares
  }

  /**
   * 📅 获取月度结算信息
   */
  async getMonthlySettlement(coupleId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const bills = await this.findByCouple(coupleId, { startDate, endDate })
    const stats = await this.getStatistics(coupleId, { startDate, endDate })

    const couple = await this.prisma.couple.findUnique({
      where: { id: coupleId },
      include: { user1: true, user2: true },
    })

    // 计算结算差额
    const difference = Math.abs(stats.user1Total - stats.user2Total)
    const payer = stats.user1Total > stats.user2Total ? couple?.user2 : couple?.user1
    const receiver = stats.user1Total > stats.user2Total ? couple?.user1 : couple?.user2

    // 生成温馨总结
    const summary = this.generateMonthlySummary(stats, month)

    return {
      year,
      month,
      totalAmount: stats.totalAmount,
      billCount: stats.count,
      user1: {
        id: couple?.user1Id,
        name: couple?.user1.username,
        totalPaid: stats.user1Total,
      },
      user2: {
        id: couple?.user2Id,
        name: couple?.user2.username,
        totalPaid: stats.user2Total,
      },
      settlement: {
        difference,
        payer: payer ? { id: payer.id, name: payer.username } : null,
        receiver: receiver ? { id: receiver.id, name: receiver.username } : null,
        message: difference > 0 
          ? `${payer?.username} 需要给 ${receiver?.username} ¥${difference.toFixed(2)}`
          : '本月已平衡，无需结算 💕',
      },
      byCategory: stats.byCategory,
      summary,
      bills,
    }
  }

  /**
   * 💕 生成月度总结文案
   */
  private generateMonthlySummary(stats: any, month: number): string {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ]

    const templates = [
      `这个${monthNames[month - 1]}我们一起花了 ¥${stats.totalAmount.toFixed(2)} 建设小家 💕`,
      `本月共同支出 ¥${stats.totalAmount.toFixed(2)}，一起创造了 ${stats.count} 个美好回忆 🎀`,
      `这个月我们的小家基金支出了 ¥${stats.totalAmount.toFixed(2)}，爱你们 💕`,
    ]

    // 随机选择一个模板
    const randomIndex = Math.floor(Math.random() * templates.length)
    return templates[randomIndex]
  }

  /**
   * 🏷️ 获取分类统计
   */
  async getCategoryStats(coupleId: string, month?: string) {
    const filters = month ? { month } : {}
    const stats = await this.getStatistics(coupleId, filters)

    // 按金额排序
    const sortedCategories = stats.byCategory.sort((a, b) => b.amount - a.amount)

    // 计算占比
    const categoriesWithPercentage = sortedCategories.map(cat => ({
      ...cat,
      percentage: stats.totalAmount > 0 
        ? ((cat.amount / stats.totalAmount) * 100).toFixed(1) 
        : '0',
    }))

    return {
      totalAmount: stats.totalAmount,
      categories: categoriesWithPercentage,
    }
  }

  /**
   * 💕 获取单个账单详情
   */
  async findOne(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        paidByUser: true,
        shares: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          }
        },
        couple: true,
      },
    })

    if (!bill) {
      throw new NotFoundException('账单不存在')
    }

    return bill
  }
}
