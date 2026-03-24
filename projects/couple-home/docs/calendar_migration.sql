-- 📅 共享日历数据库迁移脚本
-- 执行：在数据库中运行此 SQL 创建 calendar_events 表

-- 创建 calendar_events 表
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT '日程标题',
    type VARCHAR(20) NOT NULL COMMENT '日程类型：date, work, family, friend, other',
    start_time TIMESTAMP NOT NULL COMMENT '开始时间',
    end_time TIMESTAMP NOT NULL COMMENT '结束时间',
    location VARCHAR(200) NULL COMMENT '地点',
    description TEXT NULL COMMENT '描述',
    status VARCHAR(20) DEFAULT 'planned' COMMENT '状态：planned, completed, cancelled',
    confirmed_by VARCHAR(20) DEFAULT 'none' COMMENT '确认状态：none, user, partner, both',
    icon VARCHAR(10) DEFAULT '📅' COMMENT '图标 emoji',
    reminder VARCHAR(10) DEFAULT 'none' COMMENT '提醒：none, 1h, 1d, 1w',
    created_by VARCHAR(36) NOT NULL COMMENT '创建者 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='共享日历日程表';

-- 插入测试数据（可选）
INSERT INTO calendar_events (id, title, type, start_time, end_time, location, description, status, confirmed_by, icon, reminder, created_by, created_at) VALUES
('test-event-1', '周末约会', 'date', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY + 3 HOUR), '市中心电影院', '一起看电影', 'planned', 'none', '🎬', '1d', 'user-1', NOW()),
('test-event-2', '工作会议', 'work', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY + 2 HOUR), '线上会议', '项目进度讨论', 'planned', 'user', '💼', '1h', 'user-1', NOW()),
('test-event-3', '家庭聚餐', 'family', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY + 3 HOUR), '父母家', '陪父母吃饭', 'planned', 'both', '👨‍👩‍👧‍👦', '1d', 'user-2', NOW()),
('test-event-4', '朋友聚会', 'friend', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY + 4 HOUR), '咖啡馆', '和老朋友见面', 'planned', 'partner', '👯', '1d', 'user-2', NOW()),
('test-event-5', '上周已完成的活动', 'other', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY - 2 HOUR), '健身房', '一起健身', 'completed', 'both', '💪', 'none', 'user-1', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 查询示例
-- 获取所有日程（按开始时间倒序）
SELECT * FROM calendar_events ORDER BY start_time DESC LIMIT 50;

-- 获取即将开始的日程（未来 7 天）
SELECT * FROM calendar_events 
WHERE start_time >= NOW() AND start_time <= DATE_ADD(NOW(), INTERVAL 7 DAY) 
AND status = 'planned' 
ORDER BY start_time ASC;

-- 获取指定日期的日程
SELECT * FROM calendar_events 
WHERE DATE(start_time) = '2026-03-26' 
ORDER BY start_time ASC;

-- 按类型统计
SELECT type, COUNT(*) as count FROM calendar_events GROUP BY type;

-- 按状态统计
SELECT status, COUNT(*) as count FROM calendar_events GROUP BY status;

-- 更新确认状态
UPDATE calendar_events SET confirmed_by = 'both' WHERE id = 'test-event-1';

-- 标记为已完成
UPDATE calendar_events SET status = 'completed' WHERE id = 'test-event-2';
