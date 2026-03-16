import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { CreateTaskDto } from '../dto/create-task.dto'
import { UpdateTaskDto } from '../dto/update-task.dto'
import { AssignTaskDto } from '../dto/assign-task.dto'
import { CompleteTaskDto } from '../dto/complete-task.dto'

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建任务
   */
  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: createTaskDto,
      include: { assignee: true, couple: true },
    })
  }

  /**
   * 获取情侣的任务列表
   */
  async findByCouple(coupleId: string) {
    return this.prisma.task.findMany({
      where: { coupleId },
      include: { 
        assignee: true,
        assignments: {
          include: { user: true },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 获取单个任务
   */
  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { 
        assignee: true,
        assignments: {
          include: { user: true },
          orderBy: { assignedAt: 'desc' },
        },
      },
    })
    
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`)
    }
    
    return task
  }

  /**
   * 更新任务
   */
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: { assignee: true },
    })
  }

  /**
   * 删除任务
   */
  async remove(id: string) {
    await this.prisma.task.delete({ where: { id } })
    return { message: 'Task deleted successfully' }
  }

  /**
   * 分配任务给用户
   */
  async assignTask(taskId: string, assignTaskDto: AssignTaskDto) {
    const { userId, completeNow } = assignTaskDto
    
    // 验证用户存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`)
    }
    
    // 验证任务存在
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    })
    
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`)
    }
    
    // 创建分配记录
    const assignment = await this.prisma.taskAssignment.create({
      data: {
        taskId,
        userId,
        isCompleted: completeNow || false,
        completedAt: completeNow ? new Date() : null,
      },
      include: { user: true, task: true },
    })
    
    // 更新任务的 assignee
    await this.prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: userId },
    })
    
    return assignment
  }

  /**
   * 完成任务打卡
   */
  async completeTask(taskId: string, completeTaskDto: CompleteTaskDto, userId: string) {
    const { completedAt, note } = completeTaskDto
    
    // 验证任务存在
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    })
    
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`)
    }
    
    // 更新任务状态
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        assigneeId: userId,
      },
      include: { assignee: true },
    })
    
    // 创建或更新分配记录
    await this.prisma.taskAssignment.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId,
        } as any,
      },
      create: {
        taskId,
        userId,
        isCompleted: true,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
      },
    })
    
    return updatedTask
  }

  /**
   * 取消完成任务
   */
  async uncompleteTask(taskId: string) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted: false,
        completedAt: null,
      },
      include: { assignee: true },
    })
  }

  /**
   * 自动轮值分配 - 根据轮值顺序自动分配给下一人
   */
  async autoAssignRotation(coupleId: string) {
    // 获取情侣的双方用户
    const couple = await this.prisma.couple.findUnique({
      where: { id: coupleId },
      include: { user1: true, user2: true },
    })
    
    if (!couple) {
      throw new NotFoundException(`Couple with id ${coupleId} not found`)
    }
    
    const users = [couple.user1, couple.user2]
    
    // 获取所有未分配或未完成的任务
    const tasks = await this.prisma.task.findMany({
      where: {
        coupleId,
        isCompleted: false,
      },
      orderBy: { rotationOrder: 'asc' },
    })
    
    const results: Array<{ task: any; assignment: any }> = []
    
    for (const task of tasks) {
      // 计算下一个分配的用户
      const nextUserIndex = task.rotationOrder % users.length
      const nextUser = users[nextUserIndex]
      
      // 分配任务
      const assignment = await this.assignTask(task.id, { userId: nextUser.id })
      
      // 更新轮值顺序
      const updatedTask = await this.prisma.task.update({
        where: { id: task.id },
        data: { rotationOrder: task.rotationOrder + 1 },
      })
      
      results.push({ task: updatedTask, assignment })
    }
    
    return results
  }

  /**
   * 获取任务统计数据
   */
  async getStats(coupleId: string, startDate?: string, endDate?: string) {
    // 获取情侣的双方用户
    const couple = await this.prisma.couple.findUnique({
      where: { id: coupleId },
      include: { user1: true, user2: true },
    })
    
    if (!couple) {
      throw new NotFoundException(`Couple with id ${coupleId} not found`)
    }
    
    const users = [couple.user1, couple.user2]
    
    // 日期过滤
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }
    
    // 获取所有任务
    const allTasks = await this.prisma.task.findMany({
      where: { coupleId },
      include: { assignee: true },
    })
    
    // 获取分配记录
    const assignments = await this.prisma.taskAssignment.findMany({
      where: {
        task: { coupleId },
        ...(Object.keys(dateFilter).length > 0 && {
          assignedAt: dateFilter,
        }),
      },
      include: { user: true, task: true },
    })
    
    // 统计每个用户的任务数据
    const userStats = users.map(user => {
      const userAssignments = assignments.filter(a => a.userId === user.id)
      const completedCount = userAssignments.filter(a => a.isCompleted).length
      const pendingCount = userAssignments.filter(a => !a.isCompleted).length
      const totalCount = userAssignments.length
      
      return {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        totalTasks: totalCount,
        completedTasks: completedCount,
        pendingTasks: pendingCount,
        completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      }
    })
    
    // 按类型统计
    const typeStats = {
      daily: allTasks.filter(t => t.type === 'daily').length,
      weekly: allTasks.filter(t => t.type === 'weekly').length,
      monthly: allTasks.filter(t => t.type === 'monthly').length,
      custom: allTasks.filter(t => t.type === 'custom').length,
    }
    
    // 总体统计
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.isCompleted).length
    const pendingTasks = totalTasks - completedTasks
    
    return {
      coupleId,
      period: {
        start: startDate || 'all',
        end: endDate || 'all',
      },
      overview: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      byUser: userStats,
      byType: typeStats,
    }
  }

  /**
   * 获取月度统计报表
   */
  async getMonthlyStats(coupleId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`
    
    return this.getStats(coupleId, startDate, endDate)
  }
}
