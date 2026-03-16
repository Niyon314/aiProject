import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { BillsController } from './controllers/bills.controller'
import { BillsService } from './services/bills.service'
import { BillsCronService } from './bills.cron.service'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [BillsController],
  providers: [BillsService, BillsCronService],
  exports: [BillsService],
})
export class BillsModule {}
