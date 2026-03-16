import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
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

@Injectable()
export class EatingService {
  constructor(private prisma: PrismaService) {}

  // ==================== 🍽️ 餐食管理 ====================

  /**
   * 随机推荐餐食
   */
  async getRandomMeal(coupleId: string, dto: RandomMealDto) {
    const where: any = { coupleId };
    
    if (dto.type) {
      where.type = dto.type;
    }
    if (dto.category) {
      where.category = dto.category;
    }
    if (dto.excludeIds && dto.excludeIds.length > 0) {
      where.id = { notIn: dto.excludeIds };
    }

    const meals = await this.prisma.meal.findMany({ where });
    
    if (meals.length === 0) {
      throw new NotFoundException('没有找到符合条件的餐食');
    }

    // 随机选择一个
    const randomIndex = Math.floor(Math.random() * meals.length);
    const selectedMeal = meals[randomIndex];

    // 更新被选择次数
    await this.prisma.meal.update({
      where: { id: selectedMeal.id },
      data: { viewCount: { increment: 1 } },
    });

    return selectedMeal;
  }

  /**
   * 获取所有餐食
   */
  async getMeals(coupleId: string, type?: string) {
    const where: any = { coupleId };
    if (type) {
      where.type = type;
    }

    return this.prisma.meal.findMany({
      where,
      include: {
        votes: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
        recipe: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个餐食
   */
  async getMeal(id: string, coupleId: string) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, coupleId },
      include: {
        votes: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
        recipe: true,
      },
    });

    if (!meal) {
      throw new NotFoundException('餐食不存在');
    }

    return meal;
  }

  /**
   * 创建餐食
   */
  async createMeal(coupleId: string, dto: CreateMealDto) {
    return this.prisma.meal.create({
      data: {
        ...dto,
        coupleId,
      },
    });
  }

  /**
   * 更新餐食
   */
  async updateMeal(id: string, coupleId: string, dto: UpdateMealDto) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, coupleId },
    });

    if (!meal) {
      throw new NotFoundException('餐食不存在');
    }

    return this.prisma.meal.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除餐食
   */
  async deleteMeal(id: string, coupleId: string) {
    const meal = await this.prisma.meal.findFirst({
      where: { id, coupleId },
    });

    if (!meal) {
      throw new NotFoundException('餐食不存在');
    }

    return this.prisma.meal.delete({
      where: { id },
    });
  }

  /**
   * 标记为已吃
   */
  async markAsEaten(id: string, coupleId: string) {
    return this.prisma.meal.update({
      where: { id, coupleId },
      data: { lastEatenAt: new Date() },
    });
  }

  // ==================== 🗳️ 投票管理 ====================

  /**
   * 创建投票
   */
  async createVote(userId: string, coupleId: string, dto: CreateVoteDto) {
    // 检查否决权使用
    if (dto.voteType === 'veto') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingVeto = await this.prisma.vote.findFirst({
        where: {
          userId,
          vetoDate: {
            gte: today,
          },
        },
      });

      if (existingVeto) {
        throw new BadRequestException('今天的否决权已经使用过了');
      }
    }

    const vote = await this.prisma.vote.create({
      data: {
        mealId: dto.mealId,
        userId,
        voteType: dto.voteType,
        comment: dto.comment,
        roundId: dto.roundId,
        vetoUsed: dto.voteType === 'veto',
        vetoDate: dto.voteType === 'veto' ? new Date() : null,
      },
      include: {
        meal: true,
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    // 如果是投票轮次，检查是否所有人都投票了
    if (dto.roundId) {
      await this.checkVoteRound(dto.roundId, coupleId);
    }

    return vote;
  }

  /**
   * 检查投票轮次
   */
  private async checkVoteRound(roundId: string, coupleId: string) {
    const couple = await this.prisma.couple.findUnique({
      where: { id: coupleId },
    });

    if (!couple) return;

    const votes = await this.prisma.vote.findMany({
      where: { roundId },
      include: { meal: true },
    });

    // 统计每个餐食的投票
    const mealVotes: Record<string, { likes: number; dislikes: number; vetos: number }> = {};
    
    votes.forEach(vote => {
      if (!mealVotes[vote.mealId]) {
        mealVotes[vote.mealId] = { likes: 0, dislikes: 0, vetos: 0 };
      }
      
      if (vote.voteType === 'like') {
        mealVotes[vote.mealId].likes++;
      } else if (vote.voteType === 'dislike') {
        mealVotes[vote.mealId].dislikes++;
      } else if (vote.voteType === 'veto') {
        mealVotes[vote.mealId].vetos++;
      }
    });

    // 找出获胜者（票数最多且没有被否决）
    let winnerId: string | null = null;
    let maxLikes = -1;

    Object.entries(mealVotes).forEach(([mealId, stats]) => {
      if (stats.vetos === 0 && stats.likes > maxLikes) {
        maxLikes = stats.likes;
        winnerId = mealId;
      }
    });

    if (winnerId) {
      await this.prisma.vote.updateMany({
        where: { mealId: winnerId, roundId },
        data: { isWinner: true },
      });
    }
  }

  /**
   * 获取投票轮次结果
   */
  async getVoteResults(roundId: string, coupleId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { roundId },
      include: {
        meal: true,
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    // 统计结果
    const mealResults: Record<string, {
      meal: any;
      likes: number;
      dislikes: number;
      vetos: number;
      voters: string[];
    }> = {};

    votes.forEach(vote => {
      if (!mealResults[vote.mealId]) {
        mealResults[vote.mealId] = {
          meal: vote.meal,
          likes: 0,
          dislikes: 0,
          vetos: 0,
          voters: [],
        };
      }

      if (vote.voteType === 'like') {
        mealResults[vote.mealId].likes++;
      } else if (vote.voteType === 'dislike') {
        mealResults[vote.mealId].dislikes++;
      } else if (vote.voteType === 'veto') {
        mealResults[vote.mealId].vetos++;
      }

      mealResults[vote.mealId].voters.push(vote.user.username);
    });

    return Object.values(mealResults);
  }

  // ==================== 📖 食谱管理 ====================

  /**
   * 获取所有食谱
   */
  async getRecipes(coupleId: string, userId?: string, isFavorite?: boolean) {
    const where: any = {};

    if (coupleId) {
      where.coupleId = coupleId;
    }
    if (userId) {
      where.OR = [{ coupleId }, { userId }];
    }
    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    return this.prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个食谱
   */
  async getRecipe(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        meal: true,
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    // 更新浏览次数
    await this.prisma.recipe.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return recipe;
  }

  /**
   * 创建食谱
   */
  async createRecipe(userId: string, coupleId: string, dto: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: {
        ...dto,
        userId,
        coupleId,
      },
    });
  }

  /**
   * 更新食谱
   */
  async updateRecipe(id: string, userId: string, dto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe || (recipe.userId !== userId && recipe.coupleId !== userId)) {
      throw new NotFoundException('食谱不存在或无权限');
    }

    return this.prisma.recipe.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除食谱
   */
  async deleteRecipe(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe || (recipe.userId !== userId && recipe.coupleId !== userId)) {
      throw new NotFoundException('食谱不存在或无权限');
    }

    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  /**
   * 标记为做过
   */
  async markAsCooked(id: string) {
    return this.prisma.recipe.update({
      where: { id },
      data: {
        cookCount: { increment: 1 },
        lastCookedAt: new Date(),
      },
    });
  }

  // ==================== 🛒 购物清单 ====================

  /**
   * 获取购物清单
   */
  async getShoppingList(coupleId: string, isChecked?: boolean) {
    const where: any = { coupleId };
    if (isChecked !== undefined) {
      where.isChecked = isChecked;
    }

    return this.prisma.shoppingList.findMany({
      where,
      include: {
        recipe: true,
        creator: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * 创建购物项
   */
  async createShoppingItem(coupleId: string, userId: string, dto: CreateShoppingItemDto) {
    return this.prisma.shoppingList.create({
      data: {
        ...dto,
        coupleId,
        createdBy: userId,
      },
      include: {
        recipe: true,
        creator: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  /**
   * 更新购物项
   */
  async updateShoppingItem(id: string, coupleId: string, dto: UpdateShoppingItemDto) {
    const item = await this.prisma.shoppingList.findFirst({
      where: { id, coupleId },
    });

    if (!item) {
      throw new NotFoundException('购物项不存在');
    }

    const data: any = { ...dto };
    
    // 如果是标记为已购买
    if (dto.isChecked && !item.isChecked) {
      data.checkedAt = new Date();
      data.checkedBy = item.createdBy; // 简化：标记创建人为购买人
    }

    return this.prisma.shoppingList.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除购物项
   */
  async deleteShoppingItem(id: string, coupleId: string) {
    const item = await this.prisma.shoppingList.findFirst({
      where: { id, coupleId },
    });

    if (!item) {
      throw new NotFoundException('购物项不存在');
    }

    return this.prisma.shoppingList.delete({
      where: { id },
    });
  }

  /**
   * 清空已购买项
   */
  async clearCheckedItems(coupleId: string) {
    return this.prisma.shoppingList.deleteMany({
      where: {
        coupleId,
        isChecked: true,
      },
    });
  }

  // ==================== 📅 做饭排班 ====================

  /**
   * 获取排班
   */
  async getCookingSchedule(coupleId: string, startDate?: Date, endDate?: Date) {
    const where: any = { coupleId };
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.cookingSchedule.findMany({
      where,
      include: {
        cook: {
          select: { id: true, username: true, avatar: true },
        },
        recipe: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * 创建排班
   */
  async createCookingSchedule(coupleId: string, dto: CreateCookingScheduleDto) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    // 检查是否已有该时段的排班
    const existing = await this.prisma.cookingSchedule.findFirst({
      where: {
        coupleId,
        date,
        mealType: dto.mealType,
      },
    });

    if (existing) {
      throw new BadRequestException('该时段已有排班');
    }

    return this.prisma.cookingSchedule.create({
      data: {
        ...dto,
        date,
        coupleId,
      },
      include: {
        cook: {
          select: { id: true, username: true, avatar: true },
        },
        recipe: true,
      },
    });
  }

  /**
   * 更新排班
   */
  async updateCookingSchedule(id: string, coupleId: string, dto: UpdateCookingScheduleDto) {
    const schedule = await this.prisma.cookingSchedule.findFirst({
      where: { id, coupleId },
    });

    if (!schedule) {
      throw new NotFoundException('排班不存在');
    }

    const data: any = { ...dto };
    
    // 如果是标记为完成
    if (dto.isCompleted && !schedule.isCompleted) {
      data.completedAt = new Date();
    }

    return this.prisma.cookingSchedule.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除排班
   */
  async deleteCookingSchedule(id: string, coupleId: string) {
    const schedule = await this.prisma.cookingSchedule.findFirst({
      where: { id, coupleId },
    });

    if (!schedule) {
      throw new NotFoundException('排班不存在');
    }

    return this.prisma.cookingSchedule.delete({
      where: { id },
    });
  }

  /**
   * 获取今日排班
   */
  async getTodaySchedule(coupleId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.cookingSchedule.findMany({
      where: {
        coupleId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        cook: {
          select: { id: true, username: true, avatar: true },
        },
        recipe: true,
      },
      orderBy: { mealType: 'asc' },
    });
  }

  // ==================== 📊 统计 ====================

  /**
   * 获取饮食统计
   */
  async getEatingStats(coupleId: string, startDate: Date, endDate: Date) {
    const stats = await this.prisma.eatingStats.findMany({
      where: {
        coupleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // 汇总统计
    const totalStats = {
      totalMeals: 0,
      homemadeCount: 0,
      takeoutCount: 0,
      restaurantCount: 0,
      totalSpent: 0,
      user1CookCount: 0,
      user2CookCount: 0,
    };

    stats.forEach(stat => {
      totalStats.totalMeals += stat.totalMeals;
      totalStats.homemadeCount += stat.homemadeCount;
      totalStats.takeoutCount += stat.takeoutCount;
      totalStats.restaurantCount += stat.restaurantCount;
      totalStats.totalSpent += stat.totalSpent;
      totalStats.user1CookCount += stat.user1CookCount;
      totalStats.user2CookCount += stat.user2CookCount;
    });

    return {
      daily: stats,
      total: totalStats,
    };
  }
}
