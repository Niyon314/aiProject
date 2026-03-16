import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator'
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

  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '情侣 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string
}
