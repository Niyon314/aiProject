import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ApiTags, ApiOperation } from '@nestjs/common'
import { CalendarService } from './services/calendar.service'
import { CreateCalendarDto } from './dto/create-calendar.dto'

@ApiTags('日程管理')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: '创建日程' })
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarService.create(createCalendarDto)
  }

  @Get()
  @ApiOperation({ summary: '获取日程列表' })
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
      return this.calendarService.findByUser(userId)
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新日程' })
  update(@Param('id') id: string, @Body() updateCalendarDto: any) {
    return this.calendarService.update(id, updateCalendarDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除日程' })
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id)
  }
}
