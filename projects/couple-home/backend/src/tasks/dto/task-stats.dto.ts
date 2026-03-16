import { IsString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TaskStatsDto {
  @ApiProperty({ description: '情侣 ID' })
  @IsString()
  coupleId: string

  @ApiProperty({ description: '开始日期 (YYYY-MM)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string

  @ApiProperty({ description: '结束日期 (YYYY-MM)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string
}
