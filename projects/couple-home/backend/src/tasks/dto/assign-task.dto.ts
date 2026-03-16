import { IsString, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AssignTaskDto {
  @ApiProperty({ description: '分配给谁的用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '是否立即完成', required: false })
  @IsBoolean()
  @IsOptional()
  completeNow?: boolean
}
