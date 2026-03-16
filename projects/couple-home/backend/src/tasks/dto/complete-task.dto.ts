import { IsString, IsOptional, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CompleteTaskDto {
  @ApiProperty({ description: '完成时间', required: false })
  @IsDateString()
  @IsOptional()
  completedAt?: string

  @ApiProperty({ description: '完成备注', required: false })
  @IsString()
  @IsOptional()
  note?: string
}
