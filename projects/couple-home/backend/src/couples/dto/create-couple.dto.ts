import { IsString, IsDateString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCoupleDto {
  @ApiProperty({ description: '情侣昵称', example: '小明 & 小红' })
  @IsString()
  name: string

  @ApiProperty({ description: '用户 1 ID' })
  @IsString()
  user1Id: string

  @ApiProperty({ description: '用户 2 ID' })
  @IsString()
  user2Id: string

  @ApiProperty({ description: '纪念日', required: false })
  @IsDateString()
  @IsOptional()
  anniversary?: Date
}
