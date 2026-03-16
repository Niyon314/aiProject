import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class BillShareDto {
  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId: string

  @ApiProperty({ description: '分摊金额' })
  @IsNumber()
  amount: number
}

export class CreateBillDto {
  @ApiProperty({ description: '账单标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '金额' })
  @IsNumber()
  amount: number

  @ApiProperty({ description: '分类', enum: ['food', 'transport', 'housing', 'entertainment', 'shopping', 'other'] })
  @IsString()
  category: string

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '支付方式', enum: ['user1', 'user2', 'split'] })
  @IsString()
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

  @ApiProperty({ description: '分摊记录', required: false, type: [BillShareDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillShareDto)
  @IsOptional()
  shares?: BillShareDto[]
}
