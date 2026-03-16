import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateCalendarDto } from './dto/create-calendar.dto'
import { UpdateCalendarDto } from './dto/update-calendar.dto'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name)

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createCalendarDto: CreateCalendarDto) {
    const calendar = await this.prisma.calendar.create({
      data: createCalendarDto,
      include: { user: true, couple: true },
    })

    // 如果设置了提醒，发送通知
    if (createCalendarDto.reminder && createCalendarDto.reminderTime) {
      await this.notificationsService.sendCalendarReminder({
        userId: createCalendarDto.userId,
        title: `📅 新日程已创建：${createCalendarDto.title}`,
        message: createCalendarDto.description || `日程时间：${createCalendarDto.startTime} - ${createCalendarDto.endTime}`,
        type: 'calendar_reminder',
        data: { calendarId: calendar.id },
      })
    }

    this.logger.log(`✅ 创建日程：${calendar.title}`)
    return calendar
  }

  async findByCouple(coupleId: string, startDate?: Date, endDate?: Date) {
    const where: any = { coupleId }
    
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = startDate
      if (endDate) where.startTime.lte = endDate
    }

    const calendars = await this.prisma.calendar.findMany({
      where,
      include: { user: true },
      orderBy: { startTime: 'asc' },
    })

    this.logger.log(`📋 获取情侣日程：${coupleId}, 数量：${calendars.length}`)
    return calendars
  }

  async findByUser(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId }
    
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = startDate
      if (endDate) where.startTime.lte = endDate
    }

    const calendars = await this.prisma.calendar.findMany({
      where,
      include: { couple: true },
      orderBy: { startTime: 'asc' },
    })

    this.logger.log(`📋 获取用户日程：${userId}, 数量：${calendars.length}`)
    return calendars
  }

  async findById(id: string) {
    return this.prisma.calendar.findUnique({
      where: { id },
      include: { user: true, couple: true },
    })
  }

  async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    const calendar = await this.prisma.calendar.update({
      where: { id },
      data: updateCalendarDto,
      include: { user: true, couple: true },
    })

    this.logger.log(`✏️ 更新日程：${calendar.title}`)
    return calendar
  }

  async remove(id: string) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id } })
    await this.prisma.calendar.delete({ where: { id } })
    
    this.logger.log(`🗑️ 删除日程：${calendar?.title}`)
    return { message: 'Calendar event deleted', id }
  }

  /**
   * 按日期范围获取日程（支持日/周/月视图）
   */
  async findByDateRange(coupleId: string, startDate: Date, endDate: Date) {
    return this.findByCouple(coupleId, startDate, endDate)
  }

  /**
   * 获取今日日程
   */
  async findToday(coupleId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.findByDateRange(coupleId, today, tomorrow)
  }

  /**
   * 获取本周日程
   */
  async findThisWeek(coupleId: string) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    return this.findByDateRange(coupleId, startOfWeek, endOfWeek)
  }

  /**
   * 获取本月日程
   */
  async findThisMonth(coupleId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return this.findByDateRange(coupleId, startOfMonth, endOfMonth)
  }

  /**
   * 检查并发送即将到期的提醒
   */
  async checkReminders() {
    const now = new Date()
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000)

    const upcomingCalendars = await this.prisma.calendar.findMany({
      where: {
        reminder: true,
        startTime: {
          gte: now,
          lte: nextHour,
        },
      },
      include: { user: true },
    })

    return this.notificationsService.checkAndSendReminders(upcomingCalendars)
  }
}
