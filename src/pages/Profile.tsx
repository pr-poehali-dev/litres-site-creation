import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { purchases } = usePurchases();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'expensive' | 'cheap'>('newest');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const toggleOrderExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const sortedPurchases = [...purchases].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'expensive':
        return b.totalAmount - a.totalAmount;
      case 'cheap':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalBooks = purchases.reduce((sum, purchase) => sum + purchase.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Icon name="BookOpen" className="text-primary" size={32} />
              <h1 className="text-2xl font-bold text-primary">Pulse Book</h1>
            </div>
            
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Личный кабинет</h2>
          <p className="text-muted-foreground">Управляйте своим профилем и покупками</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего куплено книг</CardTitle>
              <Icon name="BookOpen" className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общая сумма покупок</CardTitle>
              <Icon name="CreditCard" className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpent} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заказов</CardTitle>
              <Icon name="ShoppingBag" className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="orders">
              <Icon name="ShoppingBag" size={18} className="mr-2" />
              История покупок
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {purchases.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Icon name="ShoppingBag" size={64} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">История покупок пуста</h3>
                  <p className="text-muted-foreground mb-6">Вы еще не совершали покупки</p>
                  <Button onClick={() => navigate('/')}>
                    <Icon name="ShoppingCart" size={18} className="mr-2" />
                    Перейти в каталог
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Filter" size={20} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Сортировка:</span>
                  </div>
                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="oldest">Сначала старые</SelectItem>
                      <SelectItem value="expensive">Сначала дорогие</SelectItem>
                      <SelectItem value="cheap">Сначала дешевые</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                {sortedPurchases.map((purchase) => {
                  const isExpanded = expandedOrders.has(purchase.id);
                  return (
                  <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-muted/50 cursor-pointer" onClick={() => toggleOrderExpand(purchase.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              Заказ #{purchase.id.slice(0, 8)}
                            </CardTitle>
                            <Icon 
                              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                              size={20} 
                              className="text-muted-foreground transition-transform"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(purchase.date).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Книг: {purchase.items.length}</p>
                            <p className="text-lg font-bold text-primary">{purchase.totalAmount} ₽</p>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {purchase.status === 'completed' && '✓ Выполнен'}
                            {purchase.status === 'processing' && '⏳ В обработке'}
                            {purchase.status === 'cancelled' && '✗ Отменен'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {purchase.items.map((item) => (
                            <div 
                              key={item.bookId} 
                              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/book/${item.bookId}`)}
                            >
                              <img 
                                src={item.cover} 
                                alt={item.title}
                                className="w-12 h-16 object-cover rounded shadow-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{item.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">{item.author}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-medium text-primary">{item.price} ₽</p>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="mt-1 h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/book/${item.bookId}`);
                                  }}
                                >
                                  <Icon name="ExternalLink" size={12} className="mr-1" />
                                  Открыть
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>Дата покупки:</span>
                            <span>{new Date(purchase.date).toLocaleString('ru-RU')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>Способ оплаты:</span>
                            <span className="flex items-center gap-1">
                              <Icon name="CreditCard" size={14} />
                              ЮMoney
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <span className="text-base font-semibold">
                              Итого оплачено:
                            </span>
                            <span className="text-xl font-bold text-primary">
                              {purchase.totalAmount} ₽
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );})}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={40} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Icon name="User" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Имя</p>
                        <p className="text-sm text-muted-foreground">{user.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Icon name="Mail" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Icon name="Calendar" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">Дата регистрации</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <Icon name="LogOut" size={18} className="mr-2" />
                    Выйти из аккаунта
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;