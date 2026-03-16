import { Module } from '@nestjs/common'
import { PrismaModule } from '../common/prisma.module'
import { MomentsController } from './controllers/moments.controller'
import { MomentsService } from './services/moments.service'

@Module({
  imports: [PrismaModule],
  controllers: [MomentsController],
  providers: [MomentsService],
})
export class MomentsModule {}
