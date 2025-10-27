import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useBooks } from '@/contexts/BookContext';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { Header } from '@/components/Header';
import { BannerCarousel } from '@/components/BannerCarousel';
import { SearchSection } from '@/components/SearchSection';
import { BookCard } from '@/components/BookCard';
import { useToast } from '@/hooks/use-toast';

const genres = ['Все жанры', 'Классика', 'Фантастика', 'Детектив', 'Романтика', 'Сказка'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Все жанры');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 12 });
  const { addToCart } = useCart();
  const { books, deleteBook } = useBooks();
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();

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
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы добавить книгу в корзину',
        variant: 'destructive',
      });
      return;
    }
    
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
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы добавить книгу в избранное',
        variant: 'destructive',
      });
      return;
    }
    
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleDeleteBook = (bookId: number) => {
    deleteBook(bookId);
    toast({
      title: 'Книга удалена',
      description: 'Книга успешно удалена из каталога',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <BannerCarousel timeLeft={timeLeft} />

        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          genres={genres}
        />

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  isFavorite={favorites.includes(book.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                  onDelete={handleDeleteBook}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredBooks
                .sort((a, b) => b.id - a.id)
                .slice(0, 8)
                .map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    isFavorite={favorites.includes(book.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                    onDelete={handleDeleteBook}
                    isAdmin={isAdmin}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredBooks
                .filter(book => favorites.includes(book.id))
                .map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                    onDelete={handleDeleteBook}
                    isAdmin={isAdmin}
                  />
                ))}
            </div>
            {favorites.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Heart" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет избранных книг</h3>
                <p className="text-muted-foreground">Добавьте книги в избранное, чтобы увидеть их здесь</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
};

export default Index;