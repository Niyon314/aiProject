import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateMomentDto {
  @ApiProperty({ description: '标题', required: false })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '图片 URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[]

  @ApiProperty({ description: '位置', required: false })
  @IsString()
  @IsOptional()
  location?: string

  @ApiProperty({ description: '纬度', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number

  @ApiProperty({ description: '经度', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number

  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '情侣 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string
}
