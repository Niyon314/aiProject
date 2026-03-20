import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import type { Vote } from '../utils/db';

export default function Add() {
  const navigate = useNavigate();
  const { addVote } = useAppStore();
  const [selectedType, setSelectedType] = useState<'vote' | 'chore' | 'bill' | null>(null);

  const handleAddVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newVote: Vote = {
      id: Date.now().toString(),
      mealName: formData.get('mealName') as string,
      mealIcon: formData.get('mealIcon') as string || '🍽️',
      likes: 0,
      dislikes: 0,
      vetoes: 0,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    };

    await addVote(newVote);
    navigate('/');
  };

  const types = [
    { id: 'vote', icon: '🍽️', title: '吃饭投票', desc: '今天吃什么？', color: 'from-macaron-blue to-macaron-purple' },
    { id: 'chore', icon: '🧹', title: '家务任务', desc: '分配家务', color: 'from-macaron-green to-macaron-blue' },
    { id: 'bill', icon: '💰', title: '账单记录', desc: '记录开销', color: 'from-macaron-yellow to-macaron-peach' },
    { id: 'schedule', icon: '📅', title: '日程安排', desc: '约会计划', color: 'from-macaron-purple to-macaron-peach' },
    { id: 'moment', icon: '📸', title: '上传回忆', desc: '记录美好', color: 'from-pink-300 to-pink-400' },
  ];

  return (
    <div className="min-h-screen pb-[80px] animate-fade-in">
      <Header 
        title="发布" 
        onBack={() => navigate('/')}
      />
      
      <div className="px-4 py-6 space-y-6">
        {!selectedType ? (
          <>
            <p className="text-white text-center">选择要发布的内容</p>
            
            <div className="space-y-3">
              {types.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`w-full bg-gradient-to-br ${type.color} rounded-md p-4 shadow-md text-left transition-all hover:shadow-lg hover:-translate-y-0.5`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{type.icon}</span>
                    <div>
                      <p className="text-white font-heading font-semibold text-lg">
                        {type.title}
                      </p>
                      <p className="text-white/80 text-sm">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : selectedType === 'vote' ? (
          <div className="bg-white rounded-md p-6 shadow-md">
            <h3 className="text-lg font-heading font-semibold mb-4">创建吃饭投票</h3>
            
            <form onSubmit={handleAddVote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  餐食名称
                </label>
                <input
                  type="text"
                  name="mealName"
                  required
                  className="input"
                  placeholder="例如：火锅、日料、披萨..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  图标
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['🍽️', '🍜', '🍣', '🍕', '🥗', '🍱', '🍔', '🌮', '🍳', '🥘', '🍲', '🥪'].map(emoji => (
                    <label key={emoji} className="cursor-pointer">
                      <input
                        type="radio"
                        name="mealIcon"
                        value={emoji}
                        className="hidden peer"
                        defaultChecked={emoji === '🍽️'}
                      />
                      <div className="text-3xl text-center p-2 rounded-md peer-checked:bg-primary peer-checked:text-white transition-all hover:bg-gray-100">
                        {emoji}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="flex-1 btn btn-ghost"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  创建投票
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-md p-8 text-center text-white">
            <p className="text-5xl mb-3">🚧</p>
            <p className="text-lg font-heading">功能开发中</p>
            <p className="text-sm opacity-80">敬请期待~</p>
            <button
              onClick={() => setSelectedType(null)}
              className="mt-4 btn bg-white text-primary-dark"
            >
              返回
            </button>
          </div>
        )}
      </div>

      <TabBar activeTab="add" />
    </div>
  );
}
