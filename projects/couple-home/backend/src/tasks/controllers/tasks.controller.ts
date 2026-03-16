import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TasksService } from '../services/tasks.service'
import { CreateTaskDto } from '../dto/create-task.dto'
import { UpdateTaskDto } from '../dto/update-task.dto'
import { AssignTaskDto } from '../dto/assign-task.dto'
import { CompleteTaskDto } from '../dto/complete-task.dto'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('🧹 家务任务')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: '创建任务' })
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto)
  }

  @Get()
  @ApiOperation({ summary: '获取情侣的任务列表' })
  @UseGuards(AuthGuard('jwt'))
  findByCouple(@Query('coupleId') coupleId: string) {
    return this.tasksService.findByCouple(coupleId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个任务详情' })
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新任务' })
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id)
  }

  @Post(':id/assign')
  @ApiOperation({ summary: '分配任务给用户' })
  @UseGuards(AuthGuard('jwt'))
  assignTask(@Param('id') id: string, @Body() assignTaskDto: AssignTaskDto) {
    return this.tasksService.assignTask(id, assignTaskDto)
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成任务打卡' })
  @UseGuards(AuthGuard('jwt'))
  completeTask(@Param('id') id: string, @Body() completeTaskDto: CompleteTaskDto, @Query('userId') userId: string) {
    return this.tasksService.completeTask(id, completeTaskDto, userId)
  }

  @Post(':id/uncomplete')
  @ApiOperation({ summary: '取消完成任务' })
  @UseGuards(AuthGuard('jwt'))
  uncompleteTask(@Param('id') id: string) {
    return this.tasksService.uncompleteTask(id)
  }

  @Post('auto-assign')
  @ApiOperation({ summary: '自动轮值分配' })
  @UseGuards(AuthGuard('jwt'))
  autoAssignRotation(@Body() body: { coupleId: string }) {
    return this.tasksService.autoAssignRotation(body.coupleId)
  }

  @Get('stats')
  @ApiOperation({ summary: '获取任务统计数据' })
  @UseGuards(AuthGuard('jwt'))
  getStats(
    @Query('coupleId') coupleId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.tasksService.getStats(coupleId, startDate, endDate)
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: '获取月度统计报表' })
  @UseGuards(AuthGuard('jwt'))
  getMonthlyStats(
    @Query('coupleId') coupleId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.tasksService.getMonthlyStats(coupleId, year, month)
  }
}
