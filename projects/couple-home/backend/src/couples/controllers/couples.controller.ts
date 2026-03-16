import { Controller, Get, Post, Body, Patch, Param, ApiTags, ApiOperation } from '@nestjs/common'
import { CouplesService } from '../services/couples.service'
import { CreateCoupleDto } from '../dto/create-couple.dto'

@ApiTags('情侣关系')
@Controller('couples')
export class CouplesController {
  constructor(private readonly couplesService: CouplesService) {}

  @Post()
  @ApiOperation({ summary: '创建情侣关系' })
  create(@Body() createCoupleDto: CreateCoupleDto) {
    return this.couplesService.create(createCoupleDto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取情侣关系详情' })
  findOne(@Param('id') id: string) {
    return this.couplesService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新情侣关系' })
  update(@Param('id') id: string, @Body() updateCoupleDto: any) {
    return this.couplesService.update(id, updateCoupleDto)
  }
}
