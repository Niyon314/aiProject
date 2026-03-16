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

  @ApiProperty({ description: '标签数组', type: [String], required: false, example: ['旅行', '生日', '约会'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '情侣 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string
}

export class UpdateMomentDto {
  @ApiProperty({ description: '标题', required: false })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '图片 URLs', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]

  @ApiProperty({ description: '位置', required: false })
  @IsString()
  @IsOptional()
  location?: string

  @ApiProperty({ description: '标签数组', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]
}

export class QueryMomentDto {
  @ApiProperty({ description: '情侣 ID', required: false })
  @IsString()
  @IsOptional()
  coupleId?: string

  @ApiProperty({ description: '用户 ID', required: false })
  @IsString()
  @IsOptional()
  userId?: string

  @ApiProperty({ description: '标签筛选', required: false })
  @IsString()
  @IsOptional()
  tag?: string

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number

  @ApiProperty({ description: '排序方式', required: false, default: 'desc' })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc'
}
