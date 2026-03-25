import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealWishStore } from '../store/mealWishStore';

const quickRecipes = [
  { name: '西红柿炒蛋', icon: '🍳' },
  { name: '红烧肉', icon: '🥩' },
  { name: '麻婆豆腐', icon: '🌶️' },
  { name: '可乐鸡翅', icon: '🍗' },
  { name: '蔬菜沙拉', icon: '🥗' },
  { name: '酸辣粉', icon: '🍜' },
  { name: '糖醋排骨', icon: '🍖' },
  { name: '火锅', icon: '🫕' },
  { name: '寿司', icon: '🍣' },
  { name: '烤鱼', icon: '🐟' },
];

export default function MealCard() {
  const navigate = useNavigate();
  const { wishes, loadWishes } = useMealWishStore();
  const [todayPick, setTodayPick] = useState(quickRecipes[0]);

  useEffect(() => {
    loadWishes('pending');
    const idx = Math.floor(Math.random() * quickRecipes.length);
    setTodayPick(quickRecipes[idx]);
  }, []);

  const pendingWishes = wishes.filter(w => w.status === 'pending');
  const latestWish = pendingWishes.length > 0 ? pendingWishes[0] : null;

  return (
    <div
      onClick={() => navigate('/meal')}
      className="bg-white rounded-2xl p-4 shadow-sm border border-pink-200 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl animate-pulse">{todayPick.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-base">
            今天吃 {todayPick.name}？
          </p>
          {latestWish ? (
            <p className="text-xs text-pink-500 mt-0.5 truncate">
              💕 {latestWish.addedBy === 'user' ? '你' : 'TA'}想吃 {latestWish.name}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">
              点击查看推荐 · 管理想吃清单
            </p>
          )}
        </div>
        <div className="text-gray-400 text-xl">›</div>
      </div>

      {pendingWishes.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {pendingWishes.slice(0, 4).map(w => (
            <span key={w.id} className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full text-xs font-medium">
              {w.icon} {w.name}
            </span>
          ))}
          {pendingWishes.length > 4 && (
            <span className="text-gray-400 text-xs px-1">+{pendingWishes.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}
