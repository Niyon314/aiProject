import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateCalendarDto } from './dto/create-calendar.dto'

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async create(createCalendarDto: CreateCalendarDto) {
    return this.prisma.calendar.create({
      data: createCalendarDto,
      include: { user: true, couple: true },
    })
  }

  async findByCouple(coupleId: string, startDate?: Date, endDate?: Date) {
    return this.prisma.calendar.findMany({
      where: {
        coupleId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { user: true },
      orderBy: { startTime: 'asc' },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.calendar.findMany({
      where: { userId },
      include: { couple: true },
      orderBy: { startTime: 'asc' },
    })
  }

  async update(id: string, updateCalendarDto: any) {
    return this.prisma.calendar.update({
      where: { id },
      data: updateCalendarDto,
    })
  }

  async remove(id: string) {
    await this.prisma.calendar.delete({ where: { id } })
    return { message: 'Calendar event deleted' }
  }
}
