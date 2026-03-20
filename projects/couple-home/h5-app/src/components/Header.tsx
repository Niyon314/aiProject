interface HeaderProps {
  title: string;
  showNotification?: boolean;
  notificationCount?: number;
  onBack?: () => void;
}

export default function Header({ 
  title, 
  showNotification = false, 
  notificationCount = 0,
  onBack,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-br from-primary-light/95 to-primary/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="text-white text-2xl touch-target"
            >
              ←
            </button>
          )}
          <h1 className="text-white text-lg font-heading font-semibold">
            {title}
          </h1>
        </div>
        
        {showNotification && (
          <button className="relative text-white text-2xl touch-target">
            🔔
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce-slow">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
