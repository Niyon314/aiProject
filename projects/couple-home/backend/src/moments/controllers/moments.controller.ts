import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Patch, 
  Query, 
  ApiTags, 
  ApiOperation,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import { MomentsService } from '../services/moments.service'
import { CreateMomentDto, UpdateMomentDto, QueryMomentDto } from '../dto/create-moment.dto'

@ApiTags('📸 相册/瞬间')
@Controller('moments')
export class MomentsController {
  constructor(private readonly momentsService: MomentsService) {}

  /**
   * 上传照片并创建瞬间
   */
  @Post('upload')
  @ApiOperation({ summary: '上传照片并创建瞬间' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 9 }],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = join(process.cwd(), 'uploads/moments')
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath, { recursive: true })
            }
            cb(null, uploadPath)
          },
          filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            cb(null, `${randomName}${extname(file.originalname)}`)
          },
        }),
      }
    )
  )
  async uploadAndCreate(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() createMomentDto: CreateMomentDto,
  ) {
    // 构建图片 URLs
    const imageUrls = files.images?.map(file => `/uploads/moments/${file.filename}`) || []
    
    // 合并用户传入的 images 和上传的文件
    const allImages = [...(createMomentDto.images || []), ...imageUrls]

    return this.momentsService.create({
      ...createMomentDto,
      images: allImages,
    })
  }

  /**
   * 创建瞬间（仅 URLs）
   */
  @Post()
  @ApiOperation({ summary: '创建瞬间（使用已有图片 URLs）' })
  create(@Body() createMomentDto: CreateMomentDto) {
    return this.momentsService.create(createMomentDto)
  }

  /**
   * 获取瞬间列表
   */
  @Get()
  @ApiOperation({ summary: '获取瞬间列表（支持分页、标签筛选）' })
  findAll(@Query() query: QueryMomentDto) {
    return this.momentsService.findAll(query)
  }

  /**
   * 获取时间线（按月分组）
   */
  @Get('timeline')
  @ApiOperation({ summary: '获取时间线（按月分组）' })
  getTimeline(
    @Query('coupleId') coupleId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    if (!coupleId) {
      return { error: 'coupleId is required' }
    }
    return this.momentsService.getTimeline(coupleId, year, month)
  }

  /**
   * 获取所有标签
   */
  @Get('tags')
  @ApiOperation({ summary: '获取所有标签（用于筛选）' })
  getAllTags(
    @Query('coupleId') coupleId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.momentsService.getAllTags(coupleId, userId)
  }

  /**
   * 按标签筛选
   */
  @Get('tag/:tag')
  @ApiOperation({ summary: '按标签筛选瞬间' })
  findByTag(
    @Param('tag') tag: string,
    @Query('coupleId') coupleId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.momentsService.findByTag(coupleId, tag, page, limit)
  }

  /**
   * 获取"去年的今天"回忆
   */
  @Get('memories')
  @ApiOperation({ summary: '获取"去年的今天"回忆' })
  getMemories(
    @Query('userId') userId: string,
    @Query('coupleId') coupleId?: string,
  ) {
    if (!userId) {
      return { error: 'userId is required' }
    }
    return this.momentsService.getMemories(userId, coupleId)
  }

  /**
   * 按情侣获取瞬间
   */
  @Get('couple/:coupleId')
  @ApiOperation({ summary: '按情侣获取瞬间列表' })
  findByCouple(
    @Param('coupleId') coupleId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.momentsService.findByCouple(coupleId, page, limit)
  }

  /**
   * 按用户获取瞬间
   */
  @Get('user/:userId')
  @ApiOperation({ summary: '按用户获取瞬间列表' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.momentsService.findByUser(userId, page, limit)
  }

  /**
   * 获取单个瞬间
   */
  @Get(':id')
  @ApiOperation({ summary: '获取单个瞬间详情' })
  findOne(@Param('id') id: string) {
    return this.momentsService.findOne(id)
  }

  /**
   * 更新瞬间
   */
  @Put(':id')
  @ApiOperation({ summary: '更新瞬间' })
  update(@Param('id') id: string, @Body() updateMomentDto: UpdateMomentDto) {
    return this.momentsService.update(id, updateMomentDto)
  }

  /**
   * 删除瞬间
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除瞬间' })
  remove(@Param('id') id: string) {
    return this.momentsService.remove(id)
  }

  /**
   * 点赞
   */
  @Post(':id/like')
  @ApiOperation({ summary: '点赞瞬间' })
  like(@Param('id') id: string) {
    return this.momentsService.like(id)
  }

  /**
   * 取消点赞
   */
  @Post(':id/unlike')
  @ApiOperation({ summary: '取消点赞' })
  unlike(@Param('id') id: string) {
    return this.momentsService.unlike(id)
  }
}
