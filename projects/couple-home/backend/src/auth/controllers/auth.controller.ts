import { Controller, Post, Body, ApiTags, ApiOperation, ApiResponse } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { LoginDto } from '../dto/login.dto'
import { RegisterDto } from '../dto/register.dto'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }
}
