import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CouplesModule } from './couples/couples.module'
import { TasksModule } from './tasks/tasks.module'
import { BillsModule } from './bills/bills.module'
import { MomentsModule } from './moments/moments.module'
import { CalendarModule } from './calendar/calendar.module'
import { AnniversariesModule } from './anniversaries/anniversaries.module'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    CouplesModule,
    TasksModule,
    BillsModule,
    MomentsModule,
    CalendarModule,
    AnniversariesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
