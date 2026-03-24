-- 🎯 愿望清单数据库迁移脚本
-- 执行：在数据库中运行此 SQL 创建 wishlist 相关表

-- 创建 wishlist_items 表
CREATE TABLE IF NOT EXISTS wishlist_items (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT '愿望标题',
    description TEXT COMMENT '愿望描述',
    budget DECIMAL(10,2) NOT NULL COMMENT '预算金额',
    current_amount DECIMAL(10,2) DEFAULT 0 COMMENT '已存金额',
    priority INT NOT NULL COMMENT '优先级 (1-5 星)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending=待实现，completed=已完成',
    deadline TIMESTAMP NULL COMMENT '计划完成日期',
    created_by VARCHAR(50) NOT NULL COMMENT '创建者 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_status_created_at (status, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='愿望清单项目';

-- 创建 wishlist_contributions 表
CREATE TABLE IF NOT EXISTS wishlist_contributions (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL COMMENT '愿望项目 ID',
    user_id VARCHAR(50) NOT NULL COMMENT '助力者 ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '助力金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_item_id (item_id),
    INDEX idx_user_id (user_id),
    INDEX idx_item_user (item_id, user_id),
    FOREIGN KEY (item_id) REFERENCES wishlist_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='愿望助力记录';

-- 插入测试数据（可选）
INSERT INTO wishlist_items (id, title, description, budget, current_amount, priority, status, deadline, created_by, created_at) VALUES
('wish-1', '✈️ 去日本旅行', '一起去日本看樱花，体验温泉和美食', 20000.00, 8000.00, 5, 'pending', '2026-08-01 00:00:00', 'user-1', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('wish-2', '🎮 买 Switch 游戏机', '可以一起玩马里奥赛车和分手厨房', 3000.00, 1500.00, 4, 'pending', '2026-05-01 00:00:00', 'user-2', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('wish-3', '📸 买拍立得相机', '记录我们的美好时光', 800.00, 800.00, 3, 'completed', '2026-02-14 00:00:00', 'user-1', DATE_SUB(NOW(), INTERVAL 60 DAY));

-- 插入助力记录
INSERT INTO wishlist_contributions (id, item_id, user_id, amount, created_at) VALUES
('contrib-1', 'wish-1', 'user-1', 5000.00, DATE_SUB(NOW(), INTERVAL 25 DAY)),
('contrib-2', 'wish-1', 'user-2', 3000.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
('contrib-3', 'wish-2', 'user-1', 500.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('contrib-4', 'wish-2', 'user-2', 1000.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('contrib-5', 'wish-3', 'user-1', 400.00, DATE_SUB(NOW(), INTERVAL 55 DAY)),
('contrib-6', 'wish-3', 'user-2', 400.00, DATE_SUB(NOW(), INTERVAL 50 DAY));

-- 查询示例
-- 获取所有愿望（按创建时间倒序）
SELECT * FROM wishlist_items ORDER BY created_at DESC;

-- 获取待实现的愿望
SELECT * FROM wishlist_items WHERE status = 'pending' ORDER BY priority DESC, created_at DESC;

-- 获取愿望进度
SELECT 
    id, 
    title, 
    budget, 
    current_amount,
    ROUND((current_amount / budget) * 100, 2) as progress_percent
FROM wishlist_items 
WHERE status = 'pending';

-- 获取某个愿望的助力记录
SELECT * FROM wishlist_contributions WHERE item_id = 'wish-1' ORDER BY created_at DESC;

-- 统计每个用户的助力总额
SELECT user_id, SUM(amount) as total_contributed 
FROM wishlist_contributions 
GROUP BY user_id;

-- 更新愿望金额（当有助力时）
UPDATE wishlist_items 
SET current_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM wishlist_contributions 
    WHERE item_id = wishlist_items.id
)
WHERE id = 'wish-1';
