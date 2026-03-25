import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

export default function Add() {
  const navigate = useNavigate();
  const [_selectedType, setSelectedType] = useState<string | null>(null);

  const types = [
    { id: 'meal', icon: '🍽️', title: '想吃的', desc: '加到想吃清单', color: 'from-pink-400 to-rose-400', path: '/meal' },
    { id: 'chore', icon: '🧹', title: '家务任务', desc: '分配家务', color: 'from-blue-400 to-cyan-400', path: '/chores' },
    { id: 'bill', icon: '💰', title: '账单记录', desc: '记录开销', color: 'from-yellow-400 to-orange-400', path: '/bills' },
    { id: 'schedule', icon: '📅', title: '日程安排', desc: '约会计划', color: 'from-purple-400 to-pink-400', path: '/calendar' },
    { id: 'diary', icon: '📖', title: '恋爱日记', desc: '记录美好', color: 'from-pink-300 to-rose-300', path: '/diary' },
    { id: 'movie', icon: '🎬', title: '想看的电影', desc: '加入观影清单', color: 'from-indigo-400 to-purple-400', path: '/movies' },
    { id: 'wish', icon: '🎯', title: '许个愿望', desc: '加入愿望清单', color: 'from-emerald-400 to-teal-400', path: '/wishlist' },
    { id: 'message', icon: '💌', title: '写留言', desc: '给 TA 一个惊喜', color: 'from-rose-400 to-pink-400', path: '/messages' },
  ];

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="➕ 发布" 
        onBack={() => navigate('/')}
      />
      
      <div className="px-4 py-6 space-y-4">
        <p className="text-white text-center text-sm opacity-80">选择要发布的内容</p>
        
        <div className="grid grid-cols-2 gap-3">
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                navigate(type.path);
              }}
              className={`bg-gradient-to-br ${type.color} rounded-2xl p-5 shadow-md text-left transition-all hover:shadow-lg hover:-translate-y-0.5`}
            >
              <span className="text-4xl block mb-2">{type.icon}</span>
              <p className="text-white font-bold text-base">{type.title}</p>
              <p className="text-white/80 text-xs mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <TabBar activeTab="add" />
    </div>
  );
}
