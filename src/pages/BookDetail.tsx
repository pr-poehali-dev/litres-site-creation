import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useBooks } from '@/contexts/BookContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books } = useBooks();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { hasPurchased } = usePurchases();
  const { toast } = useToast();
  
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [editBookOpen, setEditBookOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  
  const book = books.find(b => b.id === Number(id));

  useEffect(() => {
    if (!book) {
      navigate('/');
    } else if (book.formats && book.formats.length > 0) {
      setSelectedFormat(book.formats[0].format);
    }
  }, [book, navigate]);

  if (!book) {
    return null;
  }

  const handleAddToCart = (type: 'download' | 'ebook') => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы добавить книгу в корзину',
        variant: 'destructive',
      });
      return;
    }
    
    const price = type === 'download' ? book.price : book.ebookPrice;
    
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: price,
      cover: book.cover,
      genre: book.genre,
    });
    toast({
      title: 'Добавлено в корзину',
      description: `${book.title} добавлена в корзину`,
    });
  };

  const isPurchased = user ? hasPurchased(user.email, book.id) : false;
  const isDownloadFree = book.price === 0;
  const isEbookFree = book.ebookPrice === 0 || book.ebookPrice === null;

  const handleDownload = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы скачать книгу',
        variant: 'destructive',
      });
      return;
    }

    if (!isPurchased && !isDownloadFree) {
      toast({
        title: 'Книга не куплена',
        description: 'Сначала купите книгу, чтобы её скачать',
        variant: 'destructive',
      });
      return;
    }

    const format = book.formats?.find(f => f.format === selectedFormat);
    if (format) {
      const link = document.createElement('a');
      link.href = format.fileUrl;
      link.download = `${book.title}.${selectedFormat}`;
      link.click();
      
      toast({
        title: 'Скачивание начато',
        description: `${book.title} в формате ${selectedFormat.toUpperCase()}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <Icon name="ChevronLeft" size={20} className="mr-2" />
            Назад
          </Button>
          
          {isAuthenticated && user?.isAdmin && (
            <Button
              variant="outline"
              onClick={() => setEditBookOpen(true)}
            >
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="object-cover w-full h-full"
                />
                {book.badges && book.badges.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {book.badges.map((badge) => (
                      <Badge 
                        key={badge} 
                        className={
                          badge === 'Новинка' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                          badge === 'Популярное' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                          badge === 'Бестселлер' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                          badge === 'Скидка' ? 'bg-red-500 hover:bg-red-600 text-white' :
                          ''
                        }
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={20} className="text-yellow-500" fill="currentColor" />
                  <span className="text-lg font-semibold">{book.rating}</span>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">{book.genre}</Badge>
                {book.isAdultContent && (
                  <Badge variant="destructive" className="text-sm px-3 py-1">18+</Badge>
                )}
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </div>

            {(book.formats && book.formats.length > 0) || book.ebookText ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Доступные форматы</h3>
                <div className="flex flex-wrap gap-2">
                  {book.formats?.map((format) => (
                    <Button
                      key={format.format}
                      variant={selectedFormat === format.format ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFormat(format.format)}
                      className="uppercase"
                    >
                      {format.format}
                    </Button>
                  ))}
                  {book.ebookText && (
                    <Button
                      variant="default"
                      size="sm"
                      className="cursor-default"
                    >
                      Электронная книга
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

            <div className="border-t pt-6 space-y-6">
              {book.formats && book.formats.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Цена скачивания</p>
                    <p className="text-3xl font-bold text-primary">
                      {isDownloadFree ? 'Бесплатно' : `${book.price} ₽`}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    {isDownloadFree || isPurchased ? (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="flex-1 min-w-[200px]"
                        onClick={handleDownload}
                      >
                        <Icon name="Download" size={20} className="mr-2" />
                        Скачать ({selectedFormat.toUpperCase()})
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        className="flex-1 min-w-[200px]"
                        onClick={() => handleAddToCart('download')}
                      >
                        <Icon name="ShoppingCart" size={20} className="mr-2" />
                        Купить
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {book.ebookText && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Цена электронной книги</p>
                    <p className="text-3xl font-bold text-primary">
                      {isEbookFree ? 'Бесплатно' : `${book.ebookPrice} ₽`}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    {isEbookFree || isPurchased ? (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="flex-1 min-w-[200px]"
                        onClick={() => navigate(`/read/${book.id}`)}
                      >
                        <Icon name="BookOpen" size={20} className="mr-2" />
                        Читать онлайн
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        className="flex-1 min-w-[200px]"
                        onClick={() => handleAddToCart('ebook')}
                      >
                        <Icon name="ShoppingCart" size={20} className="mr-2" />
                        Купить
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
      <AddBookDialog open={editBookOpen} onOpenChange={setEditBookOpen} bookToEdit={book} />
    </div>
  );
};

export default BookDetail;