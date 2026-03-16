-- 🍽️ 吃饭安排模块 - 数据库迁移脚本
-- 执行时间：2026-03-16
-- 描述：创建吃饭安排相关的数据表

-- 如果表已存在则跳过创建

-- 🍽️ 餐食推荐表
CREATE TABLE IF NOT EXISTS "meals" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- restaurant, homemade, takeout
  "category" TEXT, -- chinese, western, japanese, korean, etc.
  "description" TEXT,
  "imageUrl" TEXT,
  "price" DOUBLE PRECISION,
  "location" TEXT,
  "rating" DOUBLE PRECISION DEFAULT 5.0,
  "tags" TEXT[] DEFAULT '{}',
  "coupleId" TEXT NOT NULL REFERENCES "couples"("id") ON DELETE CASCADE,
  "isRecipe" BOOLEAN DEFAULT false,
  "recipeId" TEXT UNIQUE, -- 关联的食谱 ID
  "isFavorite" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "lastEatenAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "meals_coupleId_type_idx" ON "meals"("coupleId", "type");

-- 🗳️ 投票表
CREATE TABLE IF NOT EXISTS "votes" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "mealId" TEXT NOT NULL REFERENCES "meals"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "users"("id"),
  "voteType" TEXT NOT NULL, -- like, dislike, veto
  "comment" TEXT,
  "roundId" TEXT, -- 投票轮次 ID
  "isWinner" BOOLEAN DEFAULT false,
  "vetoUsed" BOOLEAN DEFAULT false,
  "vetoDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("mealId", "userId", "roundId")
);

-- 📖 食谱表
CREATE TABLE IF NOT EXISTS "recipes" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "ingredients" TEXT[] DEFAULT '{}',
  "steps" TEXT[] DEFAULT '{}',
  "difficulty" TEXT DEFAULT 'medium', -- easy, medium, hard
  "cookTime" INTEGER, -- 分钟
  "servings" INTEGER DEFAULT 2,
  "calories" INTEGER,
  "protein" DOUBLE PRECISION,
  "carbs" DOUBLE PRECISION,
  "fat" DOUBLE PRECISION,
  "imageUrl" TEXT,
  "images" TEXT[] DEFAULT '{}',
  "source" TEXT,
  "sourceType" TEXT, -- website, book, family, original
  "tags" TEXT[] DEFAULT '{}',
  "isFavorite" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "cookCount" INTEGER DEFAULT 0,
  "userId" TEXT NOT NULL REFERENCES "users"("id"),
  "coupleId" TEXT REFERENCES "couples"("id"),
  "mealId" TEXT UNIQUE REFERENCES "meals"("id"),
  "lastCookedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "recipes_coupleId_idx" ON "recipes"("coupleId");
CREATE INDEX IF NOT EXISTS "recipes_userId_idx" ON "recipes"("userId");

-- 🛒 购物清单表
CREATE TABLE IF NOT EXISTS "shopping_list" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL, -- vegetable, meat, fruit, dairy, etc.
  "quantity" TEXT,
  "price" DOUBLE PRECISION,
  "priority" TEXT DEFAULT 'normal', -- low, normal, high, urgent
  "isChecked" BOOLEAN DEFAULT false,
  "checkedAt" TIMESTAMP,
  "checkedBy" TEXT,
  "recipeId" TEXT REFERENCES "recipes"("id"),
  "note" TEXT,
  "coupleId" TEXT NOT NULL REFERENCES "couples"("id") ON DELETE CASCADE,
  "createdBy" TEXT NOT NULL REFERENCES "users"("id"),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "shopping_list_coupleId_isChecked_idx" ON "shopping_list"("coupleId", "isChecked");

-- 📅 做饭排班表
CREATE TABLE IF NOT EXISTS "cooking_schedules" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "date" DATE NOT NULL,
  "cookId" TEXT NOT NULL REFERENCES "users"("id"),
  "mealType" TEXT NOT NULL, -- breakfast, lunch, dinner
  "mealName" TEXT,
  "recipeId" TEXT REFERENCES "recipes"("id"),
  "isCompleted" BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  "rating" DOUBLE PRECISION,
  "comment" TEXT,
  "coupleId" TEXT NOT NULL REFERENCES "couples"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("date", "mealType", "coupleId")
);

CREATE INDEX IF NOT EXISTS "cooking_schedules_coupleId_date_idx" ON "cooking_schedules"("coupleId", "date");

-- 📊 饮食统计表
CREATE TABLE IF NOT EXISTS "eating_stats" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "coupleId" TEXT NOT NULL REFERENCES "couples"("id") ON DELETE CASCADE,
  "totalMeals" INTEGER DEFAULT 0,
  "homemadeCount" INTEGER DEFAULT 0,
  "takeoutCount" INTEGER DEFAULT 0,
  "restaurantCount" INTEGER DEFAULT 0,
  "totalSpent" DOUBLE PRECISION DEFAULT 0,
  "avgPerMeal" DOUBLE PRECISION DEFAULT 0,
  "favoriteCategory" TEXT,
  "user1CookCount" INTEGER DEFAULT 0,
  "user2CookCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("date", "coupleId")
);

-- 添加注释
COMMENT ON TABLE "meals" IS '🍽️ 餐食推荐表';
COMMENT ON TABLE "votes" IS '🗳️ 投票表';
COMMENT ON TABLE "recipes" IS '📖 食谱表';
COMMENT ON TABLE "shopping_list" IS '🛒 购物清单表';
COMMENT ON TABLE "cooking_schedules" IS '📅 做饭排班表';
COMMENT ON TABLE "eating_stats" IS '📊 饮食统计表';
