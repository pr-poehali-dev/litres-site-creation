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
    if (!isPurchased) {
      toast({
        title: 'Книга не куплена',
        description: 'Купите электронную версию книги, чтобы её читать',
        variant: 'destructive',
      });
      navigate(`/book/${id}`);
    }
  }, [book, id, navigate, user, hasPurchased, toast]);

  if (!book || !book.ebookText) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/book/${id}`)}
          >
            <Icon name="ChevronLeft" size={20} className="mr-2" />
            Назад к описанию
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
            >
              <Icon name="Minus" size={16} />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{fontSize}px</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          <div className="mb-8 text-center border-b pb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground">{book.author}</p>
          </div>

          <div 
            className="prose prose-sm md:prose-base max-w-none leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
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

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/book/${id}`)}
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
