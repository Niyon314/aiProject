import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    })
  }

  async findAll() {
    return this.prisma.user.findMany()
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        couple: true,
        tasks: true,
        bills: true,
        moments: true,
        calendars: true,
        anniversaries: true,
      },
    })
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })
    
    return user
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    })
    
    return { message: 'User deleted successfully' }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }
}
