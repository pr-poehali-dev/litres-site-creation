import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'Home', label: 'Главная' },
    { path: '/new-releases', icon: 'Sparkles', label: 'Новинки' },
    { path: '/catalog', icon: 'Library', label: 'Каталог' },
    { path: '/music', icon: 'Music', label: 'Музыка' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t shadow-lg">
      <div className="flex items-center justify-around px-2 py-3 safe-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-[60px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground active:bg-muted"
              )}
            >
              <Icon 
                name={item.icon as any} 
                size={24} 
                className={isActive ? "text-primary" : ""}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};