import { Link } from 'react-router-dom';

interface TabBarProps {
  activeTab: string;
}

export default function TabBar({ activeTab }: TabBarProps) {
  const tabs = [
    { id: 'home', icon: '🏠', label: '首页', path: '/' },
    { id: 'schedule', icon: '📅', label: '日程', path: '/calendar' },
    { id: 'add', icon: '➕', label: '发布', path: '/add', isAction: true },
    { id: 'movies', icon: '🎬', label: '观影', path: '/movies' },
    { id: 'wishlist', icon: '🎯', label: '愿望', path: '/wishlist' },
    { id: 'profile', icon: '👤', label: '我的', path: '/profile' },
  ];

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
