import type { Anniversary } from '../utils/db';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  daysTogether: number;
}

export default function AnniversaryCard({ anniversary, daysTogether }: AnniversaryCardProps) {
  const nextAnniversary = new Date(anniversary.date);
  const today = new Date();
  nextAnniversary.setFullYear(today.getFullYear());
  
  if (nextAnniversary < today) {
    nextAnniversary.setFullYear(today.getFullYear() + 1);
  }
  
  const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="card-primary p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">💝 {anniversary.name}</p>
          <p className="text-white text-2xl font-heading font-bold">
            第 {daysTogether} 天
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl mb-2 animate-float">{anniversary.icon}</p>
          <p className="text-white text-sm bg-white/20 px-3 py-1 rounded-full inline-block">
            💕 {daysUntil} 天后
          </p>
        </div>
      </div>
    </div>
  );
}
