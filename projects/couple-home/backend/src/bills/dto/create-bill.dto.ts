import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

/**
 * 💰 账单分摊记录 DTO
 */
export class BillShareDto {
  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '分摊金额' })
  @IsNumber()
  amount: number
}

/**
 * 🎀 分摊模式枚举
 */
export enum SplitMode {
  EQUAL = 'equal',      // 平均 AA
  RATIO = 'ratio',      // 按比例
  CUSTOM = 'custom',    // 自定义
  GIFT = 'gift',        // 这次我请
}

/**
 * 📝 账单类别枚举
 */
export enum BillCategory {
  FOOD = 'food',              // 🍔 餐饮
  TRANSPORT = 'transport',    // 🚗 交通
  HOUSING = 'housing',        // 🏠 居住
  ENTERTAINMENT = 'entertainment', // 🎬 娱乐
  SHOPPING = 'shopping',      // 🛍️ 购物
  MEDICAL = 'medical',        // 💊 医疗
  EDUCATION = 'education',    // 📚 教育
  OTHER = 'other',            // 📦 其他
}

/**
 * 💕 创建账单 DTO
 */
export class CreateBillDto {
  @ApiProperty({ description: '账单标题', example: '一起喝的奶茶' })
  @IsString()
  title: string

  @ApiProperty({ description: '金额', example: 58.0 })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({ 
    description: '分类', 
    enum: BillCategory,
    example: BillCategory.FOOD 
  })
  @IsEnum(BillCategory)
  category: BillCategory

  @ApiProperty({ description: '描述', required: false, example: '因为你今天加班辛苦了' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ 
    description: '支付方式', 
    enum: ['user1', 'user2', 'split'],
    example: 'user1'
  })
  @IsString()
  @IsEnum(['user1', 'user2', 'split'])
  paidBy: string

  @ApiProperty({ description: '支付用户 ID' })
  @IsString()
  paidById: string

  @ApiProperty({ description: '情侣 ID' })
  @IsString()
  coupleId: string

  @ApiProperty({ description: '账单日期', required: false })
  @IsDateString()
  @IsOptional()
  billDate?: Date

  @ApiProperty({ 
    description: '分摊模式', 
    enum: SplitMode,
    default: SplitMode.EQUAL,
    example: SplitMode.EQUAL
  })
  @IsEnum(SplitMode)
  @IsOptional()
  splitMode?: SplitMode

  @ApiProperty({ 
    description: '用户 1 分摊比例 (0-1)', 
    required: false,
    example: 0.6
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  splitRatio?: number

  @ApiProperty({ 
    description: '情感化备注', 
    required: false,
    example: '请你喝的奶茶，因为你今天加班辛苦了'
  })
  @IsString()
  @IsOptional()
  emotionalNote?: string

  @ApiProperty({ description: '分摊记录', required: false, type: [BillShareDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillShareDto)
  @IsOptional()
  shares?: BillShareDto[]
}

/**
 * ✏️ 更新账单 DTO
 */
export class UpdateBillDto {
  @ApiProperty({ description: '账单标题', required: false })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ description: '金额', required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number

  @ApiProperty({ description: '分类', required: false, enum: BillCategory })
  @IsEnum(BillCategory)
  @IsOptional()
  category?: BillCategory

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '情感化备注', required: false })
  @IsString()
  @IsOptional()
  emotionalNote?: string

  @ApiProperty({ description: '分摊模式', required: false, enum: SplitMode })
  @IsEnum(SplitMode)
  @IsOptional()
  splitMode?: SplitMode

  @ApiProperty({ description: '用户 1 分摊比例', required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  splitRatio?: number
}

/**
 * 📊 查询参数 DTO
 */
export class QueryBillsDto {
  @ApiProperty({ description: '情侣 ID', required: true })
  @IsString()
  coupleId: string

  @ApiProperty({ description: '开始日期', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiProperty({ description: '结束日期', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiProperty({ description: '分类筛选', required: false })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ description: '月份 (YYYY-MM)', required: false })
  @IsString()
  @IsOptional()
  month?: string
}
