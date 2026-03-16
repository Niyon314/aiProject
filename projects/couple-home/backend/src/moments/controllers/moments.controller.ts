import { Controller, Get, Post, Body, Param, Patch, Query, ApiTags, ApiOperation } from '@nestjs/common'
import { MomentsService } from './services/moments.service'
import { CreateMomentDto } from './dto/create-moment.dto'

@ApiTags('相册/瞬间')
@Controller('moments')
export class MomentsController {
  constructor(private readonly momentsService: MomentsService) {}

  @Post()
  @ApiOperation({ summary: '创建瞬间' })
  create(@Body() createMomentDto: CreateMomentDto) {
    return this.momentsService.create(createMomentDto)
  }

  @Get()
  @ApiOperation({ summary: '获取瞬间列表' })
  findByCouple(@Query('coupleId') coupleId?: string, @Query('userId') userId?: string) {
    if (coupleId) {
      return this.momentsService.findByCouple(coupleId)
    }
    if (userId) {
      return this.momentsService.findByUser(userId)
    }
  }

  @Patch(':id/like')
  @ApiOperation({ summary: '点赞' })
  like(@Param('id') id: string) {
    return this.momentsService.like(id)
  }
}
