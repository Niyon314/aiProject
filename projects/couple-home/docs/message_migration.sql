-- 💌 留言板数据库迁移脚本
-- 执行：在数据库中运行此 SQL 创建 messages 表

-- 创建 messages 表
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL COMMENT '发送者 ID',
    sender_name VARCHAR(100) NOT NULL COMMENT '发送者昵称',
    content TEXT NOT NULL COMMENT '留言内容',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    read_at TIMESTAMP NULL COMMENT '已读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_created_at (created_at DESC),
    INDEX idx_is_read (is_read),
    INDEX idx_sender_id (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言板';

-- 插入测试数据（可选）
INSERT INTO messages (id, sender_id, sender_name, content, is_read, read_at, created_at) VALUES
('test-1', 'user-1', '大笨蛋', '今天辛苦了，爱你哟~ 💕', TRUE, NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('test-2', 'user-2', '小仙女', '早安！记得吃早餐哦 🥐', FALSE, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 查询示例
-- 获取所有留言（按时间倒序）
SELECT * FROM messages ORDER BY created_at DESC LIMIT 20;

-- 获取未读数量
SELECT COUNT(*) as unread_count FROM messages WHERE is_read = FALSE;

-- 标记为已读
UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = 'test-2';
