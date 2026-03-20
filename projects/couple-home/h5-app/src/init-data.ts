import { db } from './utils/db';

async function initializeData() {
  console.log('初始化示例数据...');

  // 添加纪念日
  await db.addAnniversary({
    id: 'anniversary-1',
    name: '在一起纪念日',
    date: '2025-11-10',
    icon: '💕',
    daysTogether: 130,
  });

  // 添加一些投票示例
  await db.addVote({
    id: 'vote-1',
    mealName: '重庆火锅',
    mealIcon: '🍲',
    likes: 12,
    dislikes: 2,
    vetoes: 0,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  });

  await db.addVote({
    id: 'vote-2',
    mealName: '日料寿司',
    mealIcon: '🍣',
    likes: 8,
    dislikes: 1,
    vetoes: 1,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  });

  // 添加一些家务示例
  await db.addChore({
    id: 'chore-1',
    name: '拖地',
    icon: '🧹',
    assignee: 'user',
    dueDate: new Date().toISOString().split('T')[0],
    points: 10,
    status: 'pending',
  });

  await db.addChore({
    id: 'chore-2',
    name: '倒垃圾',
    icon: '🗑️',
    assignee: 'partner',
    dueDate: new Date().toISOString().split('T')[0],
    points: 5,
    status: 'pending',
  });

  // 添加一些账单示例
  await db.addBill({
    id: 'bill-1',
    title: '超市购物',
    amount: 256.50,
    payer: 'user',
    date: new Date().toISOString().split('T')[0],
    category: 'shopping',
    status: 'pending',
  });

  console.log('初始化完成！');
}

// 检查是否已有数据，如果没有则初始化
async function checkAndInitialize() {
  const votes = await db.getVotes();
  if (votes.length === 0) {
    await initializeData();
  }
}

checkAndInitialize();
