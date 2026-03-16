import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AnniversariesService } from './services/anniversaries.service'

/**
 * 💕 纪念日定时任务服务
 * 处理纪念日提醒等周期性任务
 */
@Injectable()
export class AnniversariesCronService {
  private readonly logger = new Logger(AnniversariesCronService.name)

  constructor(
    private anniversariesService: AnniversariesService,
  ) {}

  /**
   * 📅 每天早上 08:00 检查并发送纪念日提醒
   * 会在提前 7 天/3 天/1 天/当天发送提醒
   */
  @Cron('0 8 * * *')
  async checkAndSendAnniversaryReminders() {
    this.logger.log('💕 开始执行纪念日提醒任务...')

    try {
      const count = await this.anniversariesService.checkAndSendReminders()
      this.logger.log(`✅ 已发送 ${count} 条纪念日提醒`)
    } catch (error) {
      this.logger.error('纪念日提醒任务执行失败:', error)
    }
  }

  /**
   * 🎉 每周一 09:00 发送下周纪念日预告（可选功能）
   */
  @Cron('0 9 * * 1')
  async sendWeeklyAnniversaryPreview() {
    this.logger.log('📅 开始执行下周纪念日预告任务...')

    try {
      // 这个功能可以在未来扩展
      // 检查未来 7 天内的纪念日，发送汇总提醒
      this.logger.log('ℹ️ 下周纪念日预告功能待实现')
    } catch (error) {
      this.logger.error('下周纪念日预告任务执行失败:', error)
    }
  }
}
