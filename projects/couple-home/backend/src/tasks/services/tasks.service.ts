import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: createTaskDto,
      include: { assignee: true, couple: true },
    })
  }

  async findByCouple(coupleId: string) {
    return this.prisma.task.findMany({
      where: { coupleId },
      include: { assignee: true },
    })
  }

  async update(id: string, updateTaskDto: any) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    })
  }

  async remove(id: string) {
    await this.prisma.task.delete({ where: { id } })
    return { message: 'Task deleted' }
  }
}
