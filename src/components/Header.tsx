import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  onAuthDialogOpen: () => void;
  onCartOpen: () => void;
  onAddBookOpen: () => void;
}

export const Header = ({ onAuthDialogOpen, onCartOpen, onAddBookOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <Icon name="BookOpen" className="text-primary" size={28} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">Pulse Book</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate('/')}>
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Новинки
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              <Icon name="Library" size={18} className="mr-2" />
              Каталог
            </Button>

            <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate('/music')}>
              <Icon name="Music" size={18} className="mr-2" />
              Музыка
            </Button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {isAdmin && (
              <Button onClick={onAddBookOpen} className="hidden sm:flex">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить книгу
              </Button>
            )}
            {isAdmin && (
              <Button onClick={onAddBookOpen} size="icon" className="sm:hidden">
                <Icon name="Plus" size={18} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Icon name="Heart" size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onCartOpen}
            >
              <Icon name="ShoppingCart" size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Button>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Icon name="User" size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Icon name="User" size={16} className="mr-2" />
                    Личный кабинет
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Icon name="ShoppingBag" size={16} className="mr-2" />
                    Мои заказы
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" onClick={onAuthDialogOpen}>
                <Icon name="User" size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};