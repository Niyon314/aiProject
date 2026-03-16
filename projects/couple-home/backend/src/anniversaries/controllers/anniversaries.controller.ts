import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ApiTags, ApiOperation } from '@nestjs/common'
import { AnniversariesService } from './services/anniversaries.service'
import { CreateAnniversaryDto } from './dto/create-anniversary.dto'

@ApiTags('纪念日')
@Controller('anniversaries')
export class AnniversariesController {
  constructor(private readonly anniversariesService: AnniversariesService) {}

  @Post()
  @ApiOperation({ summary: '创建纪念日' })
  create(@Body() createAnniversaryDto: CreateAnniversaryDto) {
    return this.anniversariesService.create(createAnniversaryDto)
  }

  @Get()
  @ApiOperation({ summary: '获取纪念日列表' })
  findByUser(
    @Query('userId') userId?: string,
    @Query('coupleId') coupleId?: string,
  ) {
    if (coupleId) {
      return this.anniversariesService.findByCouple(coupleId)
    }
    if (userId) {
      return this.anniversariesService.findByUser(userId)
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新纪念日' })
  update(@Param('id') id: string, @Body() updateAnniversaryDto: any) {
    return this.anniversariesService.update(id, updateAnniversaryDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除纪念日' })
  remove(@Param('id') id: string) {
    return this.anniversariesService.remove(id)
  }
}
