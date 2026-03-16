import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ApiTags, ApiOperation } from '@nestjs/common'
import { TasksService } from '../services/tasks.service'
import { CreateTaskDto } from '../dto/create-task.dto'

@ApiTags('家务任务')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: '创建任务' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto)
  }

  @Get()
  @ApiOperation({ summary: '获取情侣的任务列表' })
  findByCouple(@Query('coupleId') coupleId: string) {
    return this.tasksService.findByCouple(coupleId)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新任务' })
  update(@Param('id') id: string, @Body() updateTaskDto: any) {
    return this.tasksService.update(id, updateTaskDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id)
  }
}
