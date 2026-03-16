import { IsString, IsDateString, IsBoolean, IsOptional, IsArray, IsInt } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateAnniversaryDto {
  @ApiProperty({ description: '纪念日名称' })
  @IsString()
  title: string

  @ApiProperty({ description: '纪念日日期' })
  @IsDateString()
  date: Date

  @ApiProperty({ description: '类型', enum: ['birthday', 'first_date', 'engagement', 'wedding', 'other'] })
  @IsString()
  type: string

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '是否每年重复', default: true })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean

  @ApiProperty({ description: '是否启用提醒', default: true })
  @IsBoolean()
  @IsOptional()
  enableReminder?: boolean

  @ApiProperty({ description: '提前几天提醒', default: [7, 3, 1, 0] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  reminderDays?: number[]

  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '情侣 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string
}

export class UpdateAnniversaryDto {
  @ApiProperty({ description: '纪念日名称', required: false })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ description: '纪念日日期', required: false })
  @IsDateString()
  @IsOptional()
  date?: Date

  @ApiProperty({ description: '类型', required: false })
  @IsString()
  @IsOptional()
  type?: string

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '是否每年重复', required: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean

  @ApiProperty({ description: '是否启用提醒', required: false })
  @IsBoolean()
  @IsOptional()
  enableReminder?: boolean

  @ApiProperty({ description: '提前几天提醒', required: false })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  reminderDays?: number[]
}
