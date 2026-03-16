import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsEnum, IsDateString } from 'class-validator';

export class CreateMealDto {
  @IsString()
  name: string;

  @IsEnum(['restaurant', 'homemade', 'takeout'])
  type: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class UpdateMealDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['restaurant', 'homemade', 'takeout'])
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class CreateVoteDto {
  @IsString()
  mealId: string;

  @IsEnum(['like', 'dislike', 'veto'])
  voteType: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  roundId?: string;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @IsOptional()
  @IsNumber()
  servings?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  mealId?: string;
}

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  steps?: string[];

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @IsOptional()
  @IsNumber()
  servings?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class CreateShoppingItemDto {
  @IsString()
  name: string;

  @IsEnum(['vegetable', 'meat', 'fruit', 'dairy', 'seasoning', 'snack', 'other'])
  category: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  recipeId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateShoppingItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['vegetable', 'meat', 'fruit', 'dairy', 'seasoning', 'snack', 'other'])
  category?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateCookingScheduleDto {
  @IsDateString()
  date: string;

  @IsString()
  cookId: string;

  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType: string;

  @IsOptional()
  @IsString()
  mealName?: string;

  @IsOptional()
  @IsString()
  recipeId?: string;
}

export class UpdateCookingScheduleDto {
  @IsOptional()
  @IsString()
  cookId?: string;

  @IsOptional()
  @IsEnum(['breakfast', 'lunch', 'dinner'])
  mealType?: string;

  @IsOptional()
  @IsString()
  mealName?: string;

  @IsOptional()
  @IsString()
  recipeId?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class RandomMealDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeIds?: string[];
}
