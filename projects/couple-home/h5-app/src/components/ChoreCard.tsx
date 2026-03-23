import type { Chore } from '../api/choreApi';
import ChoreClaim from './ChoreClaim';
import ChoreComplete from './ChoreComplete';

interface ChoreCardProps {
  chore: Chore;
  userNickname: string;
  partnerNickname: string;
  onClaim?: (id: string) => void;
  onComplete?: (id: string, proofPhoto?: string, notes?: string) => void;
}

export default function ChoreCard({
  chore,
  userNickname,
  partnerNickname,
  onClaim,
  onComplete,
}: ChoreCardProps) {
  const getStatusStyle = () => {
    switch (chore.status) {
      case 'pending':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300';
      case 'completed':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300';
      case 'overdue':
        return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusBadge = () => {
    switch (chore.status) {
      case 'pending':
        return {
          bg: 'bg-yellow-200',
          text: 'text-yellow-700',
          label: '待完成',
          icon: '⏳',
        };
      case 'completed':
        return {
          bg: 'bg-green-200',
          text: 'text-green-700',
          label: '已完成',
          icon: '✅',
        };
      case 'overdue':
        return {
          bg: 'bg-red-200',
          text: 'text-red-700',
          label: '已逾期',
          icon: '⚠️',
        };
      default:
        return {
          bg: 'bg-gray-200',
          text: 'text-gray-700',
          label: chore.status,
          icon: '📋',
        };
    }
  };

  const getTypeText = () => {
    switch (chore.type) {
      case 'daily':
        return '每日';
      case 'weekly':
        return '每周';
      case 'monthly':
        return '每月';
      case 'once':
        return '临时';
      default:
        return '';
    }
  };

  const getAssigneeText = () => {
    if (!chore.assignee) return '未认领';
    return chore.assignee === 'user' ? userNickname : partnerNickname;
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      className={`rounded-2xl p-4 border-2 shadow-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${getStatusStyle()}`}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{chore.icon}</span>
          <div>
            <h3 className="font-heading font-bold text-gray-800 text-lg">
              {chore.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              📅 {getTypeText()} | 📆 {new Date(chore.dueDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${statusBadge.bg} ${statusBadge.text}`}
          >
            {statusBadge.icon} {statusBadge.label}
          </span>
          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold">
            ⭐ {chore.points}分
          </span>
        </div>
      </div>

      {/* 认领人信息 */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">👤</span>
          <span className="text-sm font-medium text-gray-700">
            {getAssigneeText()}
          </span>
        </div>
        {chore.completedAt && (
          <span className="text-xs text-gray-500">
            🕐 {new Date(chore.completedAt).toLocaleString('zh-CN')}
          </span>
        )}
      </div>

      {/* 备注信息 */}
      {chore.notes && (
        <div className="mb-3 p-2 bg-white/60 rounded-lg">
          <p className="text-xs text-gray-600">💬 {chore.notes}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {chore.status === 'pending' && !chore.assignee && (
          <ChoreClaim choreId={chore.id} onClaim={onClaim} />
        )}
        {chore.status === 'pending' && chore.assignee === 'user' && (
          <ChoreComplete
            choreId={chore.id}
            choreName={chore.name}
            points={chore.points}
            onComplete={onComplete}
          />
        )}
        {chore.status === 'completed' && (
          <div className="flex-1 text-center py-2 text-green-600 font-semibold text-sm">
            🎉 已完成打卡
          </div>
        )}
        {chore.status === 'overdue' && (
          <div className="flex-1 text-center py-2 text-red-600 font-semibold text-sm">
            ⚠️ 已逾期，快完成吧！
          </div>
        )}
      </div>
    </div>
  );
}
