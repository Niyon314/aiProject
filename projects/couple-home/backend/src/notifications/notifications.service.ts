import { Injectable, Logger } from '@nestjs/common'

export interface NotificationPayload {
  userId: string
  title: string
  message: string
  type: 'calendar_reminder' | 'task_reminder' | 'anniversary_reminder' | 'bill_settlement' | 'general'
  data?: any
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  /**
   * 发送日程提醒通知
   */
  async sendCalendarReminder(payload: NotificationPayload) {
    this.logger.log(`📅 发送日程提醒给 userId: ${payload.userId}, 标题：${payload.title}`)
    
    // TODO: 集成实际的通知渠道
    // 1. WebSocket 推送 (实时通知)
    // 2. 小程序模板消息
    // 3. 邮件通知
    // 4. 短信通知
    
    // 当前实现：记录日志，后续可接入实际通知服务
    console.log('🔔 通知内容:', {
      to: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      data: payload.data,
    })

    return { success: true, messageId: Date.now().toString() }
  }

  /**
   * 💰 发送账单结算提醒
   */
  async sendBillSettlementReminder(payload: {
    userId: string
    coupleName: string
    month: string
    totalAmount: number
    settlementAmount: number
    isPayer: boolean
    partnerName: string
  }) {
    const { userId, coupleName, month, totalAmount, settlementAmount, isPayer, partnerName } = payload
    
    const title = isPayer 
      ? `💰 结算提醒：你需要给${partnerName}转账`
      : `💕 结算提醒：${partnerName}将给你转账`
    
    const message = isPayer
      ? `${month} 你们在${coupleName}共支出 ¥${totalAmount.toFixed(2)}，根据 AA 计算，你需要给${partnerName} ¥${settlementAmount.toFixed(2)}`
      : `${month} 你们在${coupleName}共支出 ¥${totalAmount.toFixed(2)}，${partnerName}将给你转账 ¥${settlementAmount.toFixed(2)}`
    
    const notification: NotificationPayload = {
      userId,
      title,
      message,
      type: 'bill_settlement',
      data: {
        month,
        totalAmount,
        settlementAmount,
        isPayer,
        partnerId: isPayer ? partnerName : userId, // 简化处理
      },
    }

    return this.sendCalendarReminder(notification)
  }

  /**
   * 📅 发送月度结算提醒（月末自动触发）
   */
  async sendMonthlySettlementReminders(couples: Array<{
    id: string
    name: string
    user1: { id: string; username: string }
    user2: { id: string; username: string }
    stats: {
      month: string
      totalAmount: number
      user1Total: number
      user2Total: number
    }
  }>) {
    const notifications: NotificationPayload[] = []

    for (const couple of couples) {
      const difference = Math.abs(couple.stats.user1Total - couple.stats.user2Total)
      
      if (difference < 0.01) {
        // 已平衡，发送温馨总结
        const summaryMsg = {
          userId: couple.user1.id,
          title: `💕 ${couple.stats.month} 账单总结`,
          message: `这个月你们在${couple.name}共支出 ¥${couple.stats.totalAmount.toFixed(2)}，账目已平衡，爱你们！💕`,
          type: 'bill_settlement' as const,
          data: { month: couple.stats.month, balanced: true },
        }
        notifications.push(summaryMsg)
        
        notifications.push({
          ...summaryMsg,
          userId: couple.user2.id,
        })
      } else {
        // 需要结算
        const payer = couple.stats.user1Total > couple.stats.user2Total ? couple.user2 : couple.user1
        const receiver = couple.stats.user1Total > couple.stats.user2Total ? couple.user1 : couple.user2

        // 给付款方发送提醒
        notifications.push({
          userId: payer.id,
          title: `💰 结算提醒`,
          message: `${couple.stats.month} 你需要给${receiver.username}转账 ¥${difference.toFixed(2)}`,
          type: 'bill_settlement',
          data: { 
            month: couple.stats.month, 
            amount: difference,
            receiverId: receiver.id,
            receiverName: receiver.username,
          },
        })

        // 给收款方发送提醒
        notifications.push({
          userId: receiver.id,
          title: `💕 结算提醒`,
          message: `${couple.stats.month} ${payer.username}将给你转账 ¥${difference.toFixed(2)}`,
          type: 'bill_settlement',
          data: { 
            month: couple.stats.month, 
            amount: difference,
            payerId: payer.id,
            payerName: payer.username,
          },
        })
      }
    }

    if (notifications.length > 0) {
      return this.sendBatch(notifications)
    }

    return []
  }

  /**
   * 批量发送通知
   */
  async sendBatch(payloads: NotificationPayload[]) {
    const results = await Promise.all(payloads.map(p => this.sendCalendarReminder(p)))
    return results
  }

  /**
   * 检查并发送即将到期的日程提醒
   */
  async checkAndSendReminders(upcomingCalendars: any[]) {
    const notifications: NotificationPayload[] = []

    for (const calendar of upcomingCalendars) {
      if (calendar.reminder && calendar.reminderTime) {
        const now = new Date()
        const reminderTime = new Date(calendar.reminderTime)
        
        // 如果提醒时间已到或已过
        if (now >= reminderTime) {
          notifications.push({
            userId: calendar.userId,
            title: `📅 日程提醒：${calendar.title}`,
            message: calendar.description || `您的日程即将开始：${calendar.title}`,
            type: 'calendar_reminder',
            data: { calendarId: calendar.id, startTime: calendar.startTime },
          })
        }
      }
    }

    if (notifications.length > 0) {
      return this.sendBatch(notifications)
    }

    return []
  }
}
