import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/services/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 检查邮箱是否已存在
    const existingUser = await this.usersService.findByEmail(registerDto.email)
    if (existingUser) {
      throw new ConflictException('邮箱已被注册')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    
    // 创建用户
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    // 生成 token
    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
      token,
    }
  }

  async login(loginDto: LoginDto) {
    // 查找用户
    const user = await this.usersService.findByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 生成 token
    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
      token,
    }
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId })
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token)
      return payload
    } catch {
      throw new UnauthorizedException('Token 无效')
    }
  }
}
