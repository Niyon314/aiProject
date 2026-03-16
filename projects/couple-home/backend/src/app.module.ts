import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CouplesModule } from './couples/couples.module'
import { TasksModule } from './tasks/tasks.module'
import { BillsModule } from './bills/bills.module'
import { MomentsModule } from './moments/moments.module'
import { CalendarModule } from './calendar/calendar.module'
import { AnniversariesModule } from './anniversaries/anniversaries.module'
import { NotificationsModule } from './notifications/notifications.module'
import { EatingModule } from './eating/modules/eating.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CouplesModule,
    TasksModule,
    BillsModule,
    MomentsModule,
    CalendarModule,
    AnniversariesModule,
    NotificationsModule,
    EatingModule,
  ],
})
export class AppModule {}
