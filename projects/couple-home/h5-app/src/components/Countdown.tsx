import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
  label?: string;
  icon?: string;
  showProgress?: boolean;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({
  targetDate,
  label = '倒计时',
  icon = '⏰',
  showProgress = true,
  onComplete,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const calculateTimeLeft = () => {
    const target = new Date(targetDate);
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      setIsComplete(true);
      onComplete?.();
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (isComplete) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isComplete, onComplete]);

  // 计算进度（假设一年周期）
  useEffect(() => {
    const target = new Date(targetDate);
    const now = new Date();
    
    // 找到上一个目标日期
    const lastTarget = new Date(target);
    lastTarget.setFullYear(now.getFullYear() - 1);
    
    if (now < lastTarget) {
      lastTarget.setFullYear(now.getFullYear());
    }

    const totalDuration = target.getTime() - lastTarget.getTime();
    const elapsed = now.getTime() - lastTarget.getTime();
    const calculatedProgress = Math.min((elapsed / totalDuration) * 100, 100);
    
    setProgress(calculatedProgress);
  }, [targetDate]);

  if (isComplete) {
    return (
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200 shadow-md text-center">
        <span className="text-5xl mb-3 block animate-bounce">{icon}</span>
        <p className="font-heading font-bold text-gray-800 text-lg mb-2">
          🎉 时间到！
        </p>
        <p className="text-gray-600">{label}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border-2 border-pink-200 shadow-md">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-heading font-semibold text-gray-800">
            {label}
          </span>
        </div>
        <span className="text-sm text-pink-500 font-semibold">
          仅剩 {timeLeft.days} 天
        </span>
      </div>

      {/* 倒计时数字 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-pink-500">{timeLeft.days}</p>
          <p className="text-xs text-gray-500 mt-1">天</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-pink-500">{timeLeft.hours}</p>
          <p className="text-xs text-gray-500 mt-1">时</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-pink-500">{timeLeft.minutes}</p>
          <p className="text-xs text-gray-500 mt-1">分</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-pink-500 animate-pulse">
            {timeLeft.seconds}
          </p>
          <p className="text-xs text-gray-500 mt-1">秒</p>
        </div>
      </div>

      {/* 进度条 */}
      {showProgress && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>进度</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
