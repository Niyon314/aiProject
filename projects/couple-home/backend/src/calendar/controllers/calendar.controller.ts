import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ApiTags, ApiOperation } from '@nestjs/common'
import { CalendarService } from './services/calendar.service'
import { CreateCalendarDto } from './dto/create-calendar.dto'
import { UpdateCalendarDto } from './dto/update-calendar.dto'

@ApiTags('📅 日程管理')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: '创建日程 💕' })
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarService.create(createCalendarDto)
  }

  @Get()
  @ApiOperation({ summary: '获取日程列表 📋' })
  findByCouple(
    @Query('coupleId') coupleId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    if (coupleId) {
      return this.calendarService.findByCouple(coupleId, startDate, endDate)
    }
    if (userId) {
      return this.calendarService.findByUser(userId, startDate, endDate)
    }
    throw new Error('请提供 coupleId 或 userId')
  }

  @Get('today')
  @ApiOperation({ summary: '获取今日日程 ☀️' })
  findToday(@Query('coupleId') coupleId: string) {
    return this.calendarService.findToday(coupleId)
  }

  @Get('week')
  @ApiOperation({ summary: '获取本周日程 📆' })
  findThisWeek(@Query('coupleId') coupleId: string) {
    return this.calendarService.findThisWeek(coupleId)
  }

  @Get('month')
  @ApiOperation({ summary: '获取本月日程 🌙' })
  findThisMonth(@Query('coupleId') coupleId: string) {
    return this.calendarService.findThisMonth(coupleId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取日程详情 🔍' })
  findById(@Param('id') id: string) {
    return this.calendarService.findById(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新日程 ✏️' })
  update(@Param('id') id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
    return this.calendarService.update(id, updateCalendarDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除日程 🗑️' })
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id)
  }

  @Post('check-reminders')
  @ApiOperation({ summary: '检查并发送提醒 🔔' })
  checkReminders() {
    return this.calendarService.checkReminders()
  }
}
