import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { CreateAnniversaryDto, UpdateAnniversaryDto } from '../dto/create-anniversary.dto'
import { NotificationsService } from '../../notifications/notifications.service'

interface AnniversaryWithCountdown {
  id: string
  title: string
  date: Date
  type: string
  description?: string
  isRecurring: boolean
  enableReminder: boolean
  reminderDays: number[]
  userId: string
  coupleId?: string
  countdown: {
    days: number
    nextDate: Date
    isToday: boolean
    message: string
  }
  user?: any
  couple?: any
}

@Injectable()
export class AnniversariesService {
  private readonly logger = new Logger(AnniversariesService.name)

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createAnniversaryDto: CreateAnniversaryDto) {
    const data = {
      ...createAnniversaryDto,
      enableReminder: createAnniversaryDto.enableReminder ?? true,
      reminderDays: createAnniversaryDto.reminderDays ?? [7, 3, 1, 0],
    }
    return this.prisma.anniversary.create({
      data,
      include: { user: true, couple: true },
    })
  }

  async findByUser(userId: string): Promise<AnniversaryWithCountdown[]> {
    const anniversaries = await this.prisma.anniversary.findMany({
      where: { userId },
      include: { couple: true },
      orderBy: { date: 'asc' },
    })
    return anniversaries.map(a => this.addCountdown(a))
  }

  async findByCouple(coupleId: string): Promise<AnniversaryWithCountdown[]> {
    const anniversaries = await this.prisma.anniversary.findMany({
      where: { coupleId },
      include: { user: true },
      orderBy: { date: 'asc' },
    })
    return anniversaries.map(a => this.addCountdown(a))
  }

  async findById(id: string): Promise<AnniversaryWithCountdown | null> {
    const anniversary = await this.prisma.anniversary.findUnique({
      where: { id },
      include: { user: true, couple: true },
    })
    if (!anniversary) return null
    return this.addCountdown(anniversary)
  }

  async update(id: string, updateAnniversaryDto: UpdateAnniversaryDto) {
    return this.prisma.anniversary.update({
      where: { id },
      data: updateAnniversaryDto,
    })
  }

  async remove(id: string) {
    await this.prisma.anniversary.delete({ where: { id } })
    return { message: '纪念日已删除 💕' }
  }

  /**
   * 计算倒计时
   */
  private addCountdown(anniversary: any): AnniversaryWithCountdown {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let nextDate = new Date(anniversary.date)
    nextDate.setHours(0, 0, 0, 0)

    // 如果日期已过且是重复的，计算明年的日期
    if (nextDate < today && anniversary.isRecurring) {
      nextDate.setFullYear(today.getFullYear() + 1)
    }

    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isToday = diffDays === 0

    let message = ''
    if (isToday) {
      message = '🎉 就是今天！'
    } else if (diffDays === 1) {
      message = '💕 明天就是纪念日啦~'
    } else if (diffDays <= 7) {
      message = `💖 还有 ${diffDays} 天`
    } else {
      message = `💕 距离纪念日还有 ${diffDays} 天`
    }

    return {
      ...anniversary,
      countdown: {
        days: diffDays,
        nextDate,
        isToday,
        message,
      },
    }
  }

  /**
   * 检查并发送提醒
   */
  async checkAndSendReminders() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const allAnniversaries = await this.prisma.anniversary.findMany({
      where: {
        enableReminder: true,
      },
      include: { user: true, couple: true },
    })

    const notifications: Array<{ userId: string; title: string; message: string }> = []

    for (const anniversary of allAnniversaries) {
      const anniversaryDate = new Date(anniversary.date)
      anniversaryDate.setHours(0, 0, 0, 0)

      // 计算今年的纪念日日期
      let currentYearDate = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate())
      if (currentYearDate < today) {
        currentYearDate.setFullYear(today.getFullYear() + 1)
      }

      const diffTime = currentYearDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // 检查是否需要提醒
      if (anniversary.reminderDays.includes(diffDays)) {
        const emoji = this.getTypeEmoji(anniversary.type)
        let title = ''
        let message = ''

        if (diffDays === 0) {
          title = `${emoji} 纪念日快乐！`
          message = `今天是"${anniversary.title}"，祝你们幸福美满！💕`
        } else if (diffDays === 1) {
          title = `${emoji} 明天就是纪念日啦~`
          message = `明天是"${anniversary.title}"，记得准备惊喜哦！🎁`
        } else {
          title = `${emoji} 纪念日提醒`
          message = `距离"${anniversary.title}"还有 ${diffDays} 天，提前准备礼物/安排活动吧~ 💝`
        }

        // 给用户发送通知
        notifications.push({
          userId: anniversary.userId,
          title,
          message,
        })
      }
    }

    // 发送所有通知
    for (const notification of notifications) {
      await this.notificationsService.sendCalendarReminder({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: 'anniversary_reminder',
      })
    }

    this.logger.log(`🔔 已发送 ${notifications.length} 条纪念日提醒`)
    return notifications.length
  }

  /**
   * 获取类型对应的 emoji
   */
  private getTypeEmoji(type: string): string {
    const emojiMap: Record<string, string> = {
      birthday: '🎂',
      first_date: '💕',
      engagement: '💍',
      wedding: '💒',
      other: '🎉',
    }
    return emojiMap[type] || '💕'
  }
}
