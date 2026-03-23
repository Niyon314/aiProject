import { Link } from 'react-router-dom';

interface TabBarProps {
  activeTab: 'home' | 'fridge' | 'add' | 'eating' | 'profile';
}

export default function TabBar({ activeTab }: TabBarProps) {
  const tabs = [
    { id: 'home', icon: '🏠', label: '首页', path: '/' },
    { id: 'fridge', icon: '🧊', label: '冰箱', path: '/fridge' },
    { id: 'add', icon: '➕', label: '发布', path: '/add', isAction: true },
    { id: 'eating', icon: '🍽️', label: '吃什么', path: '/eating/random' },
    { id: 'profile', icon: '👤', label: '我的', path: '/profile' },
  ] as const;

  return (
    <nav className="tab-bar safe-area-bottom">
      {tabs.map(tab => (
        <Link
          key={tab.id}
          to={tab.path}
          className={`tab-item touch-target ${activeTab === tab.id ? 'active' : ''}`}
        >
          <span className="tab-item-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
