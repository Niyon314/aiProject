import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../common/prisma.service'
import { BillsService } from './services/bills.service'
import { NotificationsService } from '../notifications/notifications.service'

/**
 * 📅 账单定时任务服务
 * 处理月末结算提醒等周期性任务
 */
@Injectable()
export class BillsCronService {
  private readonly logger = new Logger(BillsCronService.name)

  constructor(
    private prisma: PrismaService,
    private billsService: BillsService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 📅 每月最后一天 20:00 发送结算提醒
   * 注意：需要安装 @nestjs/schedule 包
   */
  // @Cron(CronExpression.EVERY_MONTH)
  async sendMonthlySettlementReminders() {
    this.logger.log('📅 开始执行月度结算提醒任务...')

    try {
      // 获取所有情侣
      const couples = await this.prisma.couple.findMany({
        include: {
          user1: true,
          user2: true,
        },
      })

      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const year = lastMonth.getFullYear()
      const month = lastMonth.getMonth() + 1
      const monthStr = `${year}-${String(month).padStart(2, '0')}`

      const settlementData = []

      // 为每对情侣计算结算信息
      for (const couple of couples) {
        try {
          const settlement = await this.billsService.getMonthlySettlement(
            couple.id,
            year,
            month,
          )

          if (settlement.totalAmount > 0) {
            settlementData.push({
              id: couple.id,
              name: couple.name,
              user1: couple.user1,
              user2: couple.user2,
              stats: {
                month: monthStr,
                totalAmount: settlement.totalAmount,
                user1Total: settlement.user1.totalPaid,
                user2Total: settlement.user2.totalPaid,
              },
            })
          }
        } catch (error) {
          this.logger.error(`处理情侣 ${couple.name} 的结算失败:`, error)
        }
      }

      // 发送通知
      if (settlementData.length > 0) {
        await this.notificationsService.sendMonthlySettlementReminders(settlementData)
        this.logger.log(`✅ 已为 ${settlementData.length} 对情侣发送结算提醒`)
      } else {
        this.logger.log('ℹ️ 本月无需要结算的账单')
      }
    } catch (error) {
      this.logger.error('月度结算提醒任务执行失败:', error)
    }
  }

  /**
   * 📊 每周日 09:00 发送本周支出总结（可选功能）
   */
  // @Cron('0 9 * * 0')
  async sendWeeklySummary() {
    this.logger.log('📊 开始执行周度支出总结任务...')

    try {
      // 计算本周的支出总结
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // 周日
      startOfWeek.setHours(0, 0, 0, 0)

      const couples = await this.prisma.couple.findMany({
        include: { user1: true, user2: true },
      })

      for (const couple of couples) {
        const stats = await this.billsService.getStatistics(couple.id, {
          startDate: startOfWeek,
          endDate: now,
        })

        if (stats.count > 0) {
          // 发送周总结通知
          await this.notificationsService.sendCalendarReminder({
            userId: couple.user1.id,
            title: '📊 本周支出总结',
            message: `你们本周共支出 ${stats.count} 笔，总计 ¥${stats.totalAmount.toFixed(2)}，一起建设美好小家 💕`,
            type: 'general',
            data: { weekStats: stats },
          })

          await this.notificationsService.sendCalendarReminder({
            userId: couple.user2.id,
            title: '📊 本周支出总结',
            message: `你们本周共支出 ${stats.count} 笔，总计 ¥${stats.totalAmount.toFixed(2)}，一起建设美好小家 💕`,
            type: 'general',
            data: { weekStats: stats },
          })
        }
      }

      this.logger.log('✅ 周度总结发送完成')
    } catch (error) {
      this.logger.error('周度总结任务执行失败:', error)
    }
  }
}
