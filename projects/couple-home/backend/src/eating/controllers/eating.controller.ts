import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EatingService } from './services/eating.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import {
  CreateMealDto,
  UpdateMealDto,
  CreateVoteDto,
  CreateRecipeDto,
  UpdateRecipeDto,
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
  CreateCookingScheduleDto,
  UpdateCookingScheduleDto,
  RandomMealDto,
} from './dto/eating.dto';

@Controller('eating')
@UseGuards(AuthGuard)
export class EatingController {
  constructor(private readonly eatingService: EatingService) {}

  // ==================== 🍽️ 餐食管理 ====================

  /**
   * 随机推荐餐食 - 今日吃什么
   */
  @Get('random')
  async getRandomMeal(@Request() req: any, @Query() dto: RandomMealDto) {
    const coupleId = req.user.coupleId;
    return this.eatingService.getRandomMeal(coupleId, dto);
  }

  /**
   * 获取所有餐食
   */
  @Get('meals')
  async getMeals(@Request() req: any, @Query('type') type?: string) {
    const coupleId = req.user.coupleId;
    return this.eatingService.getMeals(coupleId, type);
  }

  /**
   * 获取单个餐食
   */
  @Get('meals/:id')
  async getMeal(@Request() req: any, @Param('id') id: string) {
    const coupleId = req.user.coupleId;
    return this.eatingService.getMeal(id, coupleId);
  }

  /**
   * 创建餐食
   */
  @Post('meals')
  async createMeal(@Request() req: any, @Body() dto: CreateMealDto) {
    const coupleId = req.user.coupleId;
    return this.eatingService.createMeal(coupleId, dto);
  }

  /**
   * 更新餐食
   */
  @Put('meals/:id')
  async updateMeal(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ) {
    const coupleId = req.user.coupleId;
    return this.eatingService.updateMeal(id, coupleId, dto);
  }

  /**
   * 删除餐食
   */
  @Delete('meals/:id')
  async deleteMeal(@Request() req: any, @Param('id') id: string) {
    const coupleId = req.user.coupleId;
    return this.eatingService.deleteMeal(id, coupleId);
  }

  /**
   * 标记为已吃
   */
  @Post('meals/:id/eaten')
  async markAsEaten(@Request() req: any, @Param('id') id: string) {
    const coupleId = req.user.coupleId;
    return this.eatingService.markAsEaten(id, coupleId);
  }

  // ==================== 🗳️ 投票管理 ====================

  /**
   * 创建投票
   */
  @Post('votes')
  async createVote(@Request() req: any, @Body() dto: CreateVoteDto) {
    const userId = req.user.id;
    const coupleId = req.user.coupleId;
    return this.eatingService.createVote(userId, coupleId, dto);
  }

  /**
   * 获取投票结果
   */
  @Get('votes/:roundId/results')
  async getVoteResults(
    @Request() req: any,
    @Param('roundId') roundId: string,
  ) {
    const coupleId = req.user.coupleId;
    return this.eatingService.getVoteResults(roundId, coupleId);
  }

  // ==================== 📖 食谱管理 ====================

  /**
   * 获取所有食谱
   */
  @Get('recipes')
  async getRecipes(
    @Request() req: any,
    @Query('favorite') isFavorite?: string,
  ) {
    const coupleId = req.user.coupleId;
    const userId = req.user.id;
    const favorite = isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined;
    return this.eatingService.getRecipes(coupleId, userId, favorite);
  }

  /**
   * 获取单个食谱
   */
  @Get('recipes/:id')
  async getRecipe(@Param('id') id: string) {
    return this.eatingService.getRecipe(id);
  }

  /**
   * 创建食谱
   */
  @Post('recipes')
  async createRecipe(@Request() req: any, @Body() dto: CreateRecipeDto) {
    const userId = req.user.id;
    const coupleId = req.user.coupleId;
    return this.eatingService.createRecipe(userId, coupleId, dto);
  }

  /**
   * 更新食谱
   */
  @Put('recipes/:id')
  async updateRecipe(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    const userId = req.user.id;
    return this.eatingService.updateRecipe(id, userId, dto);
  }

  /**
   * 删除食谱
   */
  @Delete('recipes/:id')
  async deleteRecipe(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.eatingService.deleteRecipe(id, userId);
  }

  /**
   * 标记为做过
   */
  @Post('recipes/:id/cooked')
  async markAsCooked(@Param('id') id: string) {
    return this.eatingService.markAsCooked(id);
  }

  // ==================== 🛒 购物清单 ====================

  /**
   * 获取购物清单
   */
  @Get('shopping-list')
  async getShoppingList(
    @Request() req: any,
    @Query('checked') checked?: string,
  ) {
    const coupleId = req.user.coupleId;
    const isChecked = checked === 'true' ? true : checked === 'false' ? false : undefined;
    return this.eatingService.getShoppingList(coupleId, isChecked);
  }

  /**
   * 创建购物项
   */
  @Post('shopping-list')
  async createShoppingItem(@Request() req: any, @Body() dto: CreateShoppingItemDto) {
    const userId = req.user.id;
    const coupleId = req.user.coupleId;
    return this.eatingService.createShoppingItem(coupleId, userId, dto);
  }

  /**
   * 更新购物项
   */
  @Put('shopping-list/:id')
  async updateShoppingItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    const coupleId = req.user.coupleId;
    return this.eatingService.updateShoppingItem(id, coupleId, dto);
  }

  /**
   * 删除购物项
   */
  @Delete('shopping-list/:id')
  async deleteShoppingItem(@Request() req: any, @Param('id') id: string) {
    const coupleId = req.user.coupleId;
    return this.eatingService.deleteShoppingItem(id, coupleId);
  }

  /**
   * 清空已购买项
   */
  @Post('shopping-list/clear-checked')
  async clearCheckedItems(@Request() req: any) {
    const coupleId = req.user.coupleId;
    return this.eatingService.clearCheckedItems(coupleId);
  }

  // ==================== 📅 做饭排班 ====================

  /**
   * 获取排班
   */
  @Get('schedule')
  async getCookingSchedule(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const coupleId = req.user.coupleId;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.eatingService.getCookingSchedule(coupleId, start, end);
  }

  /**
   * 获取今日排班
   */
  @Get('schedule/today')
  async getTodaySchedule(@Request() req: any) {
    const coupleId = req.user.coupleId;
    return this.eatingService.getTodaySchedule(coupleId);
  }

  /**
   * 创建排班
   */
  @Post('schedule')
  async createCookingSchedule(
    @Request() req: any,
    @Body() dto: CreateCookingScheduleDto,
  ) {
    const coupleId = req.user.coupleId;
    return this.eatingService.createCookingSchedule(coupleId, dto);
  }

  /**
   * 更新排班
   */
  @Put('schedule/:id')
  async updateCookingSchedule(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCookingScheduleDto,
  ) {
    const coupleId = req.user.coupleId;
    return this.eatingService.updateCookingSchedule(id, coupleId, dto);
  }

  /**
   * 删除排班
   */
  @Delete('schedule/:id')
  async deleteCookingSchedule(@Request() req: any, @Param('id') id: string) {
    const coupleId = req.user.coupleId;
    return this.eatingService.deleteCookingSchedule(id, coupleId);
  }

  // ==================== 📊 统计 ====================

  /**
   * 获取饮食统计
   */
  @Get('stats')
  async getEatingStats(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const coupleId = req.user.coupleId;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.eatingService.getEatingStats(coupleId, start, end);
  }
}
