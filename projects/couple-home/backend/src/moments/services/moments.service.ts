import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateMomentDto } from './dto/create-moment.dto'

@Injectable()
export class MomentsService {
  constructor(private prisma: PrismaService) {}

  async create(createMomentDto: CreateMomentDto) {
    return this.prisma.moment.create({
      data: createMomentDto,
      include: { user: true, couple: true },
    })
  }

  async findByCouple(coupleId: string) {
    return this.prisma.moment.findMany({
      where: { coupleId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.moment.findMany({
      where: { userId },
      include: { couple: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async like(id: string) {
    return this.prisma.moment.update({
      where: { id },
      data: { likes: { increment: 1 } },
    })
  }
}
