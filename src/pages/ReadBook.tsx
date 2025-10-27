import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useBooks } from '@/contexts/BookContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const ReadBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books } = useBooks();
  const { user } = useAuth();
  const { hasPurchased } = usePurchases();
  const { toast } = useToast();
  
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  const book = books.find(b => b.id === Number(id));

  useEffect(() => {
    if (!book) {
      navigate('/');
      return;
    }

    if (!book.ebookText) {
      toast({
        title: 'Электронная книга недоступна',
        description: 'Для этой книги не добавлен текст для чтения',
        variant: 'destructive',
      });
      navigate(`/book/${id}`);
      return;
    }

    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы читать книгу',
        variant: 'destructive',
      });
      navigate(`/book/${id}`);
      return;
    }

    const isPurchased = hasPurchased(user.email, book.id);
    const isEbookFree = book.ebookPrice === 0;
    
    if (!isPurchased && !isEbookFree) {
      toast({
        title: 'Книга не куплена',
        description: 'Купите электронную версию книги, чтобы её читать',
        variant: 'destructive',
      });
      navigate(`/book/${id}`);
    }

    const preventScreenshot = (e: KeyboardEvent) => {
      if (
        (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault();
        toast({
          title: 'Скриншоты запрещены',
          description: 'Содержимое книги защищено от копирования',
          variant: 'destructive',
        });
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keyup', preventScreenshot);
    document.addEventListener('keydown', preventScreenshot);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('keyup', preventScreenshot);
      document.removeEventListener('keydown', preventScreenshot);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [book, id, navigate, user, hasPurchased, toast]);

  if (!book || !book.ebookText) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background no-screenshot">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/book/${id}`)}
            className="md:size-default"
          >
            <Icon name="ChevronLeft" size={20} className="md:mr-2" />
            <span className="hidden md:inline">Назад к описанию</span>
          </Button>

          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className="h-9 w-9 md:h-10 md:w-10 touch-manipulation"
            >
              <Icon name="Minus" size={16} />
            </Button>
            <span className="text-xs md:text-sm text-muted-foreground w-10 md:w-12 text-center">{fontSize}px</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
              className="h-9 w-9 md:h-10 md:w-10 touch-manipulation"
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-4 md:p-8 lg:p-12">
          <div className="mb-6 md:mb-8 text-center border-b pb-4 md:pb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground">{book.author}</p>
          </div>

          <div 
            className="prose prose-sm md:prose-base max-w-none leading-relaxed select-none touch-pan-y"
            style={{ 
              fontSize: `${fontSize}px`,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none',
              touchAction: 'pan-y'
            }}
            onCopy={(e) => {
              e.preventDefault();
              toast({
                title: 'Копирование запрещено',
                description: 'Содержимое книги защищено от копирования',
                variant: 'destructive',
              });
            }}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {book.ebookText.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-4 text-justify">
                  {paragraph}
                </p>
              ) : (
                <div key={index} className="h-4" />
              )
            ))}
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/book/${id}`)}
            className="touch-manipulation"
          >
            <Icon name="Book" size={16} className="mr-2" />
            Вернуться к описанию книги
          </Button>
        </div>
      </main>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
};

export default ReadBook;