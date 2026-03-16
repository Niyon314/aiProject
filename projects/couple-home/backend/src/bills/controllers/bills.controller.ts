import { Controller, Get, Post, Body, Query, ApiTags, ApiOperation } from '@nestjs/common'
import { BillsService } from './services/bills.service'
import { CreateBillDto } from './dto/create-bill.dto'

@ApiTags('账单管理')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: '创建账单' })
  create(@Body() createBillDto: CreateBillDto) {
    return this.billsService.create(createBillDto)
  }

  @Get()
  @ApiOperation({ summary: '获取情侣账单列表' })
  findByCouple(@Query('coupleId') coupleId: string) {
    return this.billsService.findByCouple(coupleId)
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取账单统计' })
  getStatistics(@Query('coupleId') coupleId: string) {
    return this.billsService.getStatistics(coupleId)
  }
}
