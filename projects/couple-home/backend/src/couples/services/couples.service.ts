import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateCoupleDto } from './dto/create-couple.dto'

@Injectable()
export class CouplesService {
  constructor(private prisma: PrismaService) {}

  async create(createCoupleDto: CreateCoupleDto) {
    // 检查两个用户是否已经有情侣关系
    const existingCouple1 = await this.prisma.user.findUnique({
      where: { id: createCoupleDto.user1Id },
      select: { coupleId: true },
    })
    
    const existingCouple2 = await this.prisma.user.findUnique({
      where: { id: createCoupleDto.user2Id },
      select: { coupleId: true },
    })

    if (existingCouple1?.coupleId || existingCouple2?.coupleId) {
      throw new BadRequestException('用户已存在情侣关系')
    }

    return this.prisma.couple.create({
      data: {
        name: createCoupleDto.name,
        user1Id: createCoupleDto.user1Id,
        user2Id: createCoupleDto.user2Id,
        anniversary: createCoupleDto.anniversary,
      },
      include: {
        user1: true,
        user2: true,
      },
    })
  }

  async findOne(id: string) {
    const couple = await this.prisma.couple.findUnique({
      where: { id },
      include: {
        user1: true,
        user2: true,
        tasks: true,
        bills: true,
        moments: true,
        calendars: true,
        anniversaries: true,
      },
    })

    if (!couple) {
      throw new NotFoundException(`Couple with ID ${id} not found`)
    }

    return couple
  }

  async update(id: string, updateCoupleDto: any) {
    return this.prisma.couple.update({
      where: { id },
      data: updateCoupleDto,
    })
  }
}
