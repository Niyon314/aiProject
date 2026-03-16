import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty({ description: '任务标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '任务描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '任务类型', enum: ['daily', 'weekly', 'monthly', 'custom'] })
  @IsString()
  type: string

  @ApiProperty({ description: '重复频率', default: 1 })
  @IsInt()
  @IsOptional()
  frequency?: number

  @ApiProperty({ description: '分配给谁的用户 ID', required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string

  @ApiProperty({ description: '情侣 ID' })
  @IsString()
  coupleId: string
}
