import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateAnniversaryDto } from './dto/create-anniversary.dto'

@Injectable()
export class AnniversariesService {
  constructor(private prisma: PrismaService) {}

  async create(createAnniversaryDto: CreateAnniversaryDto) {
    return this.prisma.anniversary.create({
      data: createAnniversaryDto,
      include: { user: true, couple: true },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.anniversary.findMany({
      where: { userId },
      include: { couple: true },
      orderBy: { date: 'asc' },
    })
  }

  async findByCouple(coupleId: string) {
    return this.prisma.anniversary.findMany({
      where: { coupleId },
      include: { user: true },
      orderBy: { date: 'asc' },
    })
  }

  async update(id: string, updateAnniversaryDto: any) {
    return this.prisma.anniversary.update({
      where: { id },
      data: updateAnniversaryDto,
    })
  }

  async remove(id: string) {
    await this.prisma.anniversary.delete({ where: { id } })
    return { message: 'Anniversary deleted' }
  }
}
