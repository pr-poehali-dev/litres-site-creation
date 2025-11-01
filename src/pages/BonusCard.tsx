import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';

interface BonusTransaction {
  id: string;
  date: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
}

const BonusCard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [transactions, setTransactions] = useState<BonusTransaction[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const userBonusData = localStorage.getItem(`bonusCard_${user?.email}`);
    if (userBonusData) {
      const data = JSON.parse(userBonusData);
      setBonusBalance(data.balance || 0);
      setCardNumber(data.cardNumber || '');
      setTransactions(data.transactions || []);
    } else {
      const newCardNumber = generateCardNumber();
      setCardNumber(newCardNumber);
      const initialData = {
        balance: 0,
        cardNumber: newCardNumber,
        transactions: [],
      };
      localStorage.setItem(`bonusCard_${user?.email}`, JSON.stringify(initialData));
    }
  }, [isAuthenticated, user, navigate]);

  const generateCardNumber = () => {
    const prefix = '4276';
    const randomPart = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return `${prefix} ${randomPart.slice(0, 4)} ${randomPart.slice(4, 8)} ${randomPart.slice(8, 12)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 mb-20 md:mb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Бонусная карта</h1>
              <p className="text-muted-foreground">Копите бонусы и оплачивайте ими покупки</p>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="CreditCard" size={32} />
                      <span className="text-xl font-bold">Pulse Book</span>
                    </div>
                    <Icon name="Sparkles" size={24} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm opacity-80">Номер карты</p>
                    <p className="text-2xl font-mono tracking-wider">{cardNumber}</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-sm opacity-80">Владелец</p>
                      <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm opacity-80">Баланс</p>
                      <p className="text-3xl font-bold">{bonusBalance} ₽</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Доступно бонусов</CardDescription>
                <CardTitle className="text-2xl">{bonusBalance} ₽</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Icon name="Wallet" size={14} className="mr-1" />
                  Можно потратить
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Всего начислено</CardDescription>
                <CardTitle className="text-2xl">
                  {transactions
                    .filter(t => t.type === 'earn')
                    .reduce((sum, t) => sum + t.amount, 0)} ₽
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Icon name="TrendingUp" size={14} className="mr-1" />
                  За все время
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Всего потрачено</CardDescription>
                <CardTitle className="text-2xl">
                  {transactions
                    .filter(t => t.type === 'spend')
                    .reduce((sum, t) => sum + t.amount, 0)} ₽
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Icon name="ShoppingBag" size={14} className="mr-1" />
                  Использовано
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>История операций</CardTitle>
              <CardDescription>
                Все начисления и списания бонусов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Receipt" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">История операций пуста</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Покупайте книги, чтобы начислялись бонусы
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice().reverse().map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'earn' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          <Icon 
                            name={transaction.type === 'earn' ? 'Plus' : 'Minus'} 
                            size={20} 
                          />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'earn' ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} ₽
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileBottomNav />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
};

export default BonusCard;
