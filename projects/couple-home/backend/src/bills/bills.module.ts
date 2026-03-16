import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { BillsController } from './controllers/bills.controller'
import { BillsService } from './services/bills.service'

@Module({
  imports: [PrismaModule],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
