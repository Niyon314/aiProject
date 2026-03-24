-- 惊喜提醒功能数据库迁移
-- 创建日期：2026-03-24
-- 功能：生日/纪念日提醒、AI 礼物推荐、约会安排建议

-- 创建 reminders 表
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT '提醒标题（如：TA 的生日）',
    date DATETIME NOT NULL COMMENT '提醒日期',
    type VARCHAR(20) NOT NULL COMMENT '类型：birthday, anniversary, holiday, custom',
    notes TEXT COMMENT '备注信息',
    reminder_days JSON COMMENT '提前提醒天数：[7, 3, 1]',
    gift_ideas JSON COMMENT '礼物推荐列表',
    date_ideas JSON COMMENT '约会安排建议',
    partner_id VARCHAR(36) COMMENT '关联的伴侣 ID',
    partner_name VARCHAR(100) COMMENT '伴侣姓名（用于显示）',
    is_recurring BOOLEAN DEFAULT FALSE COMMENT '是否每年重复',
    last_notified DATETIME COMMENT '上次通知时间',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active, completed, cancelled',
    created_by VARCHAR(36) NOT NULL COMMENT '创建者 ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_reminders_type (type),
    INDEX idx_reminders_status (status),
    INDEX idx_reminders_date (date),
    INDEX idx_reminders_created_by (created_by),
    INDEX idx_reminders_is_recurring (is_recurring)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='惊喜提醒表';

-- 插入示例数据（可选）
INSERT INTO reminders (id, title, date, type, notes, reminder_days, gift_ideas, date_ideas, partner_name, is_recurring, status, created_by, created_at, updated_at) VALUES
(
    'demo-reminder-1',
    'TA 的生日',
    '2026-03-27 00:00:00',
    'birthday',
    '喜欢粉色，想要口红或者包包',
    '[7, 3, 1]',
    '["口红 💄", "项链 💎", "包包 👜", "香水 🌸", "手表 ⌚"]',
    '["生日派对 🎂", "浪漫晚餐 🕯️", "SPA 放松 💆", "看电影 🎬", "游乐园 🎢"]',
    '小明',
    TRUE,
    'active',
    'user-123',
    NOW(),
    NOW()
),
(
    'demo-reminder-2',
    '恋爱纪念日',
    '2026-04-08 00:00:00',
    'anniversary',
    '第一次约会的地点是星巴克',
    '[7, 3, 1]',
    '["定制相册 📖", "情侣对戒 💍", "浪漫晚餐 🕯️", "短途旅行 ✈️", "鲜花束 💐"]',
    '["烛光晚餐 🕯️", "重温初次约会地点 💕", "短途旅行 ✈️", "拍情侣照 📷", "写情书 💌"]',
    '小明',
    TRUE,
    'active',
    'user-123',
    NOW(),
    NOW()
),
(
    'demo-reminder-3',
    '圣诞节',
    '2026-12-25 00:00:00',
    'holiday',
    '准备圣诞礼物和圣诞树',
    '[14, 7, 3, 1]',
    '["节日礼盒 🎁", "巧克力 🍫", "温暖围巾 🧣", "圣诞树 🎄", "红包 🧧"]',
    '["节日市集 🎪", "家庭聚餐 🍲", "看节日电影 🎬", "交换礼物 🎁", "倒计时活动 🎉"]',
    NULL,
    TRUE,
    'active',
    'user-123',
    NOW(),
    NOW()
);

-- 查询示例
-- 1. 获取所有活跃的提醒
-- SELECT * FROM reminders WHERE status = 'active' ORDER BY date ASC;

-- 2. 获取未来 30 天的提醒
-- SELECT * FROM reminders 
-- WHERE status = 'active' 
--   AND date >= NOW() 
--   AND date <= DATE_ADD(NOW(), INTERVAL 30 DAY)
-- ORDER BY date ASC;

-- 3. 获取需要今天通知的提醒（提前 N 天）
-- SELECT * FROM reminders 
-- WHERE status = 'active'
--   AND JSON_CONTAINS(reminder_days, CAST(DATEDIFF(date, CURDATE()) AS JSON))
-- ORDER BY date ASC;

-- 4. 获取特定类型的提醒
-- SELECT * FROM reminders WHERE type = 'birthday' AND status = 'active';

-- 5. 统计提醒数量
-- SELECT type, COUNT(*) as count FROM reminders WHERE status = 'active' GROUP BY type;
