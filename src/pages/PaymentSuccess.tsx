import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthDialogOpen={() => {}}
        onCartOpen={() => {}}
        onAddBookOpen={() => {}}
      />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <Icon name="CheckCircle2" size={48} className="text-green-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Оплата прошла успешно!</h1>
              <p className="text-lg text-muted-foreground">
                Спасибо за покупку
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Icon name="Gift" size={20} />
                <span className="font-medium">Книга добавлена в вашу библиотеку</span>
              </div>
              {bookId && (
                <p className="text-sm text-green-600">ID книги: #{bookId}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/profile')}
                className="w-full"
                size="lg"
              >
                <Icon name="Library" size={20} className="mr-2" />
                Перейти в библиотеку
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Icon name="Home" size={20} className="mr-2" />
                На главную
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Автоматический переход через {countdown} сек...
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;