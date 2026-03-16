import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: '情侣关系 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string
}
