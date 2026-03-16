import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Query, 
  Param, 
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger'
import { BillsService } from './services/bills.service'
import { CreateBillDto, UpdateBillDto, QueryBillsDto } from './dto/create-bill.dto'

/**
 * 💰 账单管理控制器
 * 提供账单 CRUD、AA 计算、统计等 API
 */
@ApiTags('💰 账单管理')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '✨ 创建账单', description: '添加新的共同支出记录' })
  create(@Body() createBillDto: CreateBillDto) {
    return this.billsService.create(createBillDto)
  }

  @Get()
  @ApiOperation({ summary: '📋 获取账单列表', description: '获取情侣的共同账单记录' })
  @ApiQuery({ name: 'coupleId', required: true, description: '情侣 ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'category', required: false, description: '分类筛选' })
  @ApiQuery({ name: 'month', required: false, description: '月份 (YYYY-MM)' })
  findAll(@Query() query: QueryBillsDto) {
    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      category: query.category,
      month: query.month,
    }
    return this.billsService.findByCouple(query.coupleId, filters)
  }

  @Get(':id')
  @ApiOperation({ summary: '📝 获取账单详情' })
  @ApiParam({ name: 'id', description: '账单 ID' })
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ summary: '✏️ 更新账单', description: '编辑账单信息' })
  @ApiParam({ name: 'id', description: '账单 ID' })
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billsService.update(id, updateBillDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '🗑️ 删除账单' })
  @ApiParam({ name: 'id', description: '账单 ID' })
  remove(@Param('id') id: string) {
    return this.billsService.remove(id)
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: '📊 获取账单统计概览' })
  @ApiQuery({ name: 'coupleId', required: true, description: '情侣 ID' })
  @ApiQuery({ name: 'month', required: false, description: '月份 (YYYY-MM)' })
  getStatistics(@Query('coupleId') coupleId: string, @Query('month') month?: string) {
    const filters = month ? { month } : {}
    return this.billsService.getStatistics(coupleId, filters)
  }

  @Get('statistics/categories')
  @ApiOperation({ summary: '🏷️ 获取分类统计' })
  @ApiQuery({ name: 'coupleId', required: true, description: '情侣 ID' })
  @ApiQuery({ name: 'month', required: false, description: '月份 (YYYY-MM)' })
  getCategoryStats(@Query('coupleId') coupleId: string, @Query('month') month?: string) {
    return this.billsService.getCategoryStats(coupleId, month)
  }

  @Get('settlement/monthly')
  @ApiOperation({ summary: '📅 获取月度结算信息', description: '获取指定月份的结算详情和温馨总结' })
  @ApiQuery({ name: 'coupleId', required: true, description: '情侣 ID' })
  @ApiQuery({ name: 'year', required: true, description: '年份' })
  @ApiQuery({ name: 'month', required: true, description: '月份 (1-12)' })
  getMonthlySettlement(
    @Query('coupleId') coupleId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.billsService.getMonthlySettlement(coupleId, year, month)
  }

  @Get('aa/calculate')
  @ApiOperation({ summary: '🧮 AA 计算器', description: '快速计算分摊金额（不保存）' })
  @ApiQuery({ name: 'amount', required: true, description: '总金额' })
  @ApiQuery({ name: 'mode', required: false, description: '分摊模式：equal/ratio/custom', enum: ['equal', 'ratio', 'custom'] })
  @ApiQuery({ name: 'ratio', required: false, description: '用户 1 比例 (0-1)' })
  calculateAA(
    @Query('amount') amount: number,
    @Query('mode') mode: 'equal' | 'ratio' | 'custom' = 'equal',
    @Query('ratio') ratio?: number,
  ) {
    if (mode === 'equal') {
      return {
        mode: 'equal',
        user1Amount: amount / 2,
        user2Amount: amount / 2,
        message: '平均分摊，每人 ¥' + (amount / 2).toFixed(2),
      }
    }
    
    if (mode === 'ratio' && ratio !== undefined) {
      return {
        mode: 'ratio',
        user1Amount: amount * ratio,
        user2Amount: amount * (1 - ratio),
        message: `按比例分摊：用户 1 ¥${(amount * ratio).toFixed(2)}, 用户 2 ¥${(amount * (1 - ratio)).toFixed(2)}`,
      }
    }

    return {
      mode: 'equal',
      user1Amount: amount / 2,
      user2Amount: amount / 2,
      message: '默认平均分摊',
    }
  }
}
