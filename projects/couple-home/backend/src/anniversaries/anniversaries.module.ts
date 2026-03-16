import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { AnniversariesController } from './controllers/anniversaries.controller'
import { AnniversariesService } from './services/anniversaries.service'
import { AnniversariesCronService } from './anniversaries.cron.service'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AnniversariesController],
  providers: [AnniversariesService, AnniversariesCronService],
  exports: [AnniversariesService],
})
export class AnniversariesModule {}
