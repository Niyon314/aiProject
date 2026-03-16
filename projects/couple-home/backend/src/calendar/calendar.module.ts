import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { CalendarController } from './controllers/calendar.controller'
import { CalendarService } from './services/calendar.service'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
