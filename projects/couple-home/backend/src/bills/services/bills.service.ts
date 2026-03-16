import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateBillDto } from './dto/create-bill.dto'

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(createBillDto: CreateBillDto) {
    const { shares, ...billData } = createBillDto
    
    return this.prisma.bill.create({
      data: {
        ...billData,
        shares: shares ? { create: shares } : undefined,
      },
      include: {
        paidByUser: true,
        shares: true,
      },
    })
  }

  async findByCouple(coupleId: string) {
    return this.prisma.bill.findMany({
      where: { coupleId },
      include: {
        paidByUser: true,
        shares: { include: { user: true } },
      },
      orderBy: { billDate: 'desc' },
    })
  }

  async getStatistics(coupleId: string) {
    const bills = await this.prisma.bill.findMany({
      where: { coupleId },
      select: {
        amount: true,
        category: true,
        paidById: true,
      },
    })

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0)
    const byCategory = bills.reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount
      return acc
    }, {} as Record<string, number>)

    return { totalAmount, byCategory, count: bills.length }
  }
}
