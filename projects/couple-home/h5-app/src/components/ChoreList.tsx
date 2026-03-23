import type { Chore } from '../api/choreApi';
import ChoreCard from './ChoreCard';

interface ChoreListProps {
  chores: Chore[];
  userNickname: string;
  partnerNickname: string;
  onClaim?: (id: string) => void;
  onComplete?: (id: string, proofPhoto?: string, notes?: string) => void;
  filter?: 'all' | 'pending' | 'completed' | 'overdue';
}

export default function ChoreList({
  chores,
  userNickname,
  partnerNickname,
  onClaim,
  onComplete,
  filter = 'all',
}: ChoreListProps) {
  const filteredChores = chores.filter((chore) => {
    if (filter === 'all') return true;
    return chore.status === filter;
  });

  // 按状态排序：pending > overdue > completed
  const sortedChores = [...filteredChores].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      pending: 0,
      overdue: 1,
      completed: 2,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  if (sortedChores.length === 0) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center text-white">
        <span className="text-5xl mb-4 block">🌸</span>
        <p className="text-sm font-medium">
          {filter === 'pending'
            ? '太棒了！所有待完成任务都已完成'
            : filter === 'completed'
            ? '还没有完成的任务'
            : '暂无任务'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedChores.map((chore) => (
        <ChoreCard
          key={chore.id}
          chore={chore}
          userNickname={userNickname}
          partnerNickname={partnerNickname}
          onClaim={onClaim}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
