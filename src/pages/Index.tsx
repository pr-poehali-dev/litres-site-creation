import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useBooks } from '@/contexts/BookContext';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useToast } from '@/hooks/use-toast';



const genres = ['Все жанры', 'Классика', 'Фантастика', 'Детектив', 'Романтика', 'Бизнес'];

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Все жанры');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 12 });
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { addToCart, itemCount } = useCart();
  const { books } = useBooks();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (book: typeof books[0]) => {
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover,
      genre: book.genre,
    });
    toast({
      title: 'Добавлено в корзину',
      description: `${book.title} добавлена в корзину`,
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'Все жанры' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const toggleFavorite = (bookId: number) => {
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon name="BookOpen" className="text-primary" size={32} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Pulse Book</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="text-sm font-medium">
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
              <Button variant="ghost" className="text-sm font-medium">
                <Icon name="Users" size={18} className="mr-2" />
                Авторы
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button onClick={() => setAddBookOpen(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить книгу
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Icon name="Heart" size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setCartOpen(true)}
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
                <Button variant="ghost" size="icon" onClick={() => setAuthDialogOpen(true)}>
                  <Icon name="User" size={20} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-8 md:p-12 animate-shimmer">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="animate-ping absolute h-3 w-3 rounded-full bg-yellow-300 opacity-75" />
                <div className="h-3 w-3 rounded-full bg-yellow-300" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 pulse-ring">
                  🔥 Горячее предложение
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Скидка до 50% на бестселлеры!
              </h2>
              <p className="text-lg text-white/90">
                Только сегодня — специальные цены на популярные книги. Не упустите шанс!
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 pulse-glow">
                  <Icon name="Sparkles" size={20} className="mr-2" />
                  Смотреть акции
                </Button>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <Icon name="Clock" size={20} className="text-white" />
                  <div className="flex items-center gap-1 text-white font-mono font-bold">
                    <span className="bg-white/20 rounded px-2 py-1 min-w-[2.5rem] text-center">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="animate-pulse">:</span>
                    <span className="bg-white/20 rounded px-2 py-1 min-w-[2.5rem] text-center">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="animate-pulse">:</span>
                    <span className="bg-white/20 rounded px-2 py-1 min-w-[2.5rem] text-center">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center space-y-2">
                  <Icon name="Gift" size={48} className="text-white mx-auto" />
                  <p className="text-6xl font-bold text-white">-50%</p>
                  <p className="text-white/90 font-medium">на избранное</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Поиск книг, авторов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button size="lg" className="h-12 px-8">
              <Icon name="Search" size={20} className="mr-2" />
              Найти
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {genres.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="catalog">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Каталог
            </TabsTrigger>
            <TabsTrigger value="new">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Новинки
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Icon name="Heart" size={18} className="mr-2" />
              Избранное
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <Card
                  key={book.id}
                  className="group overflow-hidden hover-lift elegant-shadow transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted shimmer-effect">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Button
                      size="icon"
                      variant={favorites.includes(book.id) ? "default" : "secondary"}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pulse-glow"
                      onClick={() => toggleFavorite(book.id)}
                    >
                      <Icon name="Heart" size={18} fill={favorites.includes(book.id) ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 pulse-ring">
                        <Icon name="Star" size={16} className="text-yellow-500" fill="currentColor" />
                        <span className="text-sm font-medium">{book.rating}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-primary pulse-ring">{book.price} ₽</span>
                      <Button size="sm" onClick={() => handleAddToCart(book)} className="pulse-glow">
                        <Icon name="ShoppingCart" size={16} className="mr-2" />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.slice(0, 4).map((book, index) => (
                <Card
                  key={book.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3">Новинка</Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-yellow-500" fill="currentColor" />
                        <span className="text-sm font-medium">{book.rating}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-primary">{book.price} ₽</span>
                      <Button size="sm" onClick={() => handleAddToCart(book)}>
                        <Icon name="ShoppingCart" size={16} className="mr-2" />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="Heart" size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Избранное пусто</h3>
                <p className="text-muted-foreground">Добавьте книги в избранное, чтобы они отображались здесь</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.filter(book => favorites.includes(book.id)).map((book, index) => (
                  <Card
                    key={book.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        size="icon"
                        variant="default"
                        className="absolute top-3 right-3"
                        onClick={() => toggleFavorite(book.id)}
                      >
                        <Icon name="Heart" size={18} fill="currentColor" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Icon name="Star" size={16} className="text-yellow-500" fill="currentColor" />
                          <span className="text-sm font-medium">{book.rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold text-primary">{book.price} ₽</span>
                        <Button size="sm" onClick={() => handleAddToCart(book)}>
                          <Icon name="ShoppingCart" size={16} className="mr-2" />
                          Купить
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-16 py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">О магазине</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>О нас</li>
                <li>Контакты</li>
                <li>Вакансии</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Покупателям</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Как купить</li>
                <li>Доставка</li>
                <li>Оплата</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Сотрудничество</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Для авторов</li>
                <li>Для издательств</li>
                <li>Партнерам</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Соцсети</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="icon">
                  <Icon name="Facebook" size={18} />
                </Button>
                <Button variant="outline" size="icon">
                  <Icon name="Twitter" size={18} />
                </Button>
                <Button variant="outline" size="icon">
                  <Icon name="Instagram" size={18} />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 BookStore. Все права защищены.
          </div>
        </div>
      </footer>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer 
        open={cartOpen} 
        onOpenChange={setCartOpen}
        onAuthRequired={() => setAuthDialogOpen(true)}
      />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
};

export default Index;