import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '手机号', required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: '用户名', example: '小明' })
  @IsString()
  username: string

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string

  @ApiProperty({ description: '头像 URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'other'], required: false })
  @IsString()
  @IsOptional()
  gender?: string

  @ApiProperty({ description: '生日', required: false })
  @IsDateString()
  @IsOptional()
  birthday?: Date
}
