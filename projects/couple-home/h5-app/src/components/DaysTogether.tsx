import { useState, useEffect } from 'react';
import type { DaysTogetherResponse } from '../api/anniversaryApi';

interface DaysTogetherProps {
  daysData: DaysTogetherResponse;
  showMilestone?: boolean;
}

export default function DaysTogether({ daysData, showMilestone = true }: DaysTogetherProps) {
  const [animatedDays, setAnimatedDays] = useState(0);

  useEffect(() => {
    const totalDays = daysData.totalDays;
    const duration = 2000; // 2 秒动画
    const steps = 60;
    const increment = totalDays / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      if (current >= steps) {
        setAnimatedDays(totalDays);
        clearInterval(timer);
      } else {
        setAnimatedDays(Math.floor(increment * current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [daysData.totalDays]);

  // 计算周年进度
  const calculateAnniversaryProgress = () => {
    const totalDays = daysData.totalDays;
    const years = Math.floor(totalDays / 365);
    const daysIntoYear = totalDays % 365;
    const progress = (daysIntoYear / 365) * 100;
    
    return {
      years,
      daysIntoYear,
      progress,
      nextAnniversary: 365 - daysIntoYear,
    };
  };

  const progress = calculateAnniversaryProgress();

  // 获取里程碑信息
  const getMilestoneText = () => {
    if (daysData.milestone) {
      const { next, daysUntil } = daysData.milestone;
      if (daysUntil <= 0) {
        return `🎉 恭喜达到 ${next} 天里程碑！`;
      }
      return `🎯 距离 ${next} 天里程碑还有 ${daysUntil} 天`;
    }
    
    // 默认里程碑
    const nextMilestone = Math.ceil(progress.daysIntoYear / 100) * 100;
    const daysUntilMilestone = nextMilestone - progress.daysIntoYear;
    
    if (daysUntilMilestone <= 0) {
      return `🎉 恭喜达到 ${progress.years * 365 + nextMilestone} 天！`;
    }
    return `🎯 距离 ${nextMilestone} 天还有 ${daysUntilMilestone} 天`;
  };

  return (
    <div className="bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl p-6 shadow-lg text-white">
      {/* 标题 */}
      <div className="text-center mb-6">
        <p className="text-white/80 text-sm mb-2">💕 我们在一起</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl font-bold font-heading animate-pulse">
            {animatedDays}
          </span>
          <span className="text-2xl">天</span>
        </div>
      </div>

      {/* 周年进度 */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">💝 第 {progress.years + 1} 年</span>
          <span className="text-sm font-semibold">
            {progress.daysIntoYear} / 365 天
          </span>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        
        <p className="text-xs text-white/80 mt-2 text-center">
          周年进度 {progress.progress.toFixed(1)}%
        </p>
      </div>

      {/* 里程碑 */}
      {showMilestone && daysData.milestone && (
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <p className="text-sm text-center font-semibold">
            {getMilestoneText()}
          </p>
        </div>
      )}

      {/* 装饰元素 */}
      <div className="flex justify-center gap-2 mt-4">
        <span className="text-2xl animate-float" style={{ animationDelay: '0s' }}>🌸</span>
        <span className="text-2xl animate-float" style={{ animationDelay: '0.2s' }}>💕</span>
        <span className="text-2xl animate-float" style={{ animationDelay: '0.4s' }}>🌸</span>
      </div>
    </div>
  );
}
