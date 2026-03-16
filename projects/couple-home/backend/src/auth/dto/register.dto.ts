import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '用户名', example: '小明' })
  @IsString()
  username: string

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ description: '手机号', required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: '头像 URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'other'], required: false })
  @IsString()
  @IsOptional()
  gender?: string
}
