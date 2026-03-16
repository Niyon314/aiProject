import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { AnniversariesController } from './controllers/anniversaries.controller'
import { AnniversariesService } from './services/anniversaries.service'

@Module({
  imports: [PrismaModule],
  controllers: [AnniversariesController],
  providers: [AnniversariesService],
})
export class AnniversariesModule {}
