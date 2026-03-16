import { Module } from '@nestjs/common';
import { EatingController } from './controllers/eating.controller';
import { EatingService } from './services/eating.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EatingController],
  providers: [EatingService],
  exports: [EatingService],
})
export class EatingModule {}
