import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { CouplesController } from './controllers/couples.controller'
import { CouplesService } from './services/couples.service'

@Module({
  imports: [PrismaModule],
  controllers: [CouplesController],
  providers: [CouplesService],
  exports: [CouplesService],
})
export class CouplesModule {}
