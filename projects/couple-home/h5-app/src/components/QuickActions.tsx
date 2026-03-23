import { Link } from 'react-router-dom';

interface QuickActionsProps {
  pendingChores: number;
  pendingBills: number;
}

export default function QuickActions({ pendingChores, pendingBills }: QuickActionsProps) {
  const actions = [
    {
      icon: '🧊',
      label: '冰箱',
      sublabel: '管理食材',
      path: '/fridge',
      color: 'from-macaron-blue to-macaron-green',
    },
    {
      icon: '🎲',
      label: '吃什么',
      sublabel: '随机推荐',
      path: '/eating/random',
      color: 'from-macaron-yellow to-macaron-peach',
    },
    {
      icon: '🧹',
      label: '家务',
      sublabel: pendingChores > 0 ? `待完成 ${pendingChores}` : '已完成',
      path: '/chores',
      color: pendingChores > 0 ? 'from-macaron-blue to-macaron-purple' : 'from-gray-200 to-gray-300',
    },
    {
      icon: '💰',
      label: '账单',
      sublabel: pendingBills > 0 ? `待确认 ${pendingBills}` : '已结清',
      path: '/bills',
      color: pendingBills > 0 ? 'from-macaron-yellow to-macaron-peach' : 'from-gray-200 to-gray-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(action => (
        <Link
          key={action.label}
          to={action.path}
          className="block"
        >
          <div className={`bg-gradient-to-br ${action.color} rounded-md p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}>
            <p className="text-2xl mb-1">{action.icon}</p>
            <p className="text-white font-heading font-semibold text-sm">
              {action.label}
            </p>
            <p className="text-white/80 text-xs">
              {action.sublabel}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
