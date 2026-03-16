import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCalendarDto {
  @ApiProperty({ description: '日程标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '日程描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startTime: Date

  @ApiProperty({ description: '结束时间' })
  @IsDateString()
  endTime: Date

  @ApiProperty({ description: '类型', enum: ['work', 'date', 'travel', 'shopping', 'entertainment', 'other'] })
  @IsString()
  type: string

  @ApiProperty({ description: '是否全天', default: false })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean

  @ApiProperty({ description: '是否重复', default: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean

  @ApiProperty({ description: '重复规则', enum: ['daily', 'weekly', 'monthly', 'yearly'], required: false })
  @IsString()
  @IsOptional()
  recurrence?: string

  @ApiProperty({ description: '是否提醒', default: true })
  @IsBoolean()
  @IsOptional()
  reminder?: boolean

  @ApiProperty({ description: '提醒时间', required: false })
  @IsDateString()
  @IsOptional()
  reminderTime?: Date

  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '情侣 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string
}
