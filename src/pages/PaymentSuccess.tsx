import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bookId) {
        navigate(`/book/${bookId}`);
      } else {
        navigate('/my-books');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [bookId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthDialogOpen={() => {}}
        onCartOpen={() => {}}
        onAddBookOpen={() => {}}
      />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle2" size={48} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Оплата прошла успешно!</h1>
            <p className="text-muted-foreground mb-6">
              Книга добавлена в вашу библиотеку
            </p>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/my-books')}
                className="w-full"
                size="lg"
              >
                <Icon name="Library" size={18} className="mr-2" />
                Перейти в библиотеку
              </Button>
              
              {bookId && (
                <Button 
                  onClick={() => navigate(`/book/${bookId}`)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icon name="Book" size={18} className="mr-2" />
                  Открыть книгу
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Автоматический переход через 5 секунд...
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
