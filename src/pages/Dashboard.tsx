import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import funcUrls from '../../backend/func2url.json';

interface SalesData {
  date?: string;
  week?: string;
  count: number;
  revenue: number;
}

interface Stats {
  booksCount: number;
  tracksCount: number;
  usersCount: number;
  purchasesCount: number;
  totalRevenue: number;
  salesByDay?: SalesData[];
  salesByWeek?: SalesData[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    booksCount: 0,
    tracksCount: 0,
    usersCount: 0,
    purchasesCount: 0,
    totalRevenue: 0,
    salesByDay: [],
    salesByWeek: []
  });
  const [loading, setLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const [booksRes, musicRes, authRes] = await Promise.all([
          fetch(`${funcUrls.books}?stats=true`),
          fetch(`${funcUrls.music}?stats=true`),
          fetch(`${funcUrls.auth}?stats=true`)
        ]);

        const booksData = await booksRes.json();
        const musicData = await musicRes.json();
        const authData = await authRes.json();

        setStats({
          booksCount: booksData.booksCount || 0,
          tracksCount: musicData.tracksCount || 0,
          usersCount: authData.usersCount || 0,
          purchasesCount: booksData.purchasesCount || 0,
          totalRevenue: booksData.totalRevenue || 0,
          salesByDay: booksData.salesByDay || [],
          salesByWeek: booksData.salesByWeek || []
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'Всего книг',
      value: stats.booksCount,
      icon: 'BookOpen',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/catalog')
    },
    {
      title: 'Музыкальных треков',
      value: stats.tracksCount,
      icon: 'Music',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/music')
    },
    {
      title: 'Пользователей',
      value: stats.usersCount,
      icon: 'Users',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      onClick: () => navigate('/users')
    },
    {
      title: 'Покупок',
      value: stats.purchasesCount,
      icon: 'ShoppingBag',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      onClick: () => {}
    },
    {
      title: 'Выручка',
      value: `${stats.totalRevenue.toLocaleString('ru-RU')} ₽`,
      icon: 'TrendingUp',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      onClick: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
            <p className="text-muted-foreground">Обзор статистики магазина</p>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <Icon name="ChevronLeft" size={20} className="mr-2" />
            Назад
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Загрузка статистики...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                  card.onClick ? 'hover:scale-[1.02]' : ''
                }`}
                onClick={card.onClick}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <Icon name={card.icon as any} size={24} className={card.color} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold">{card.value}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              Быстрые действия
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setAddBookOpen(true)}
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить книгу
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/users')}
              >
                <Icon name="Users" size={18} className="mr-2" />
                Управление пользователями
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/catalog')}
              >
                <Icon name="Library" size={18} className="mr-2" />
                Каталог книг
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Info" size={20} className="text-primary" />
              Информация
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Всего контента: {stats.booksCount + stats.tracksCount} единиц
              </p>
              <p>
                • Средний чек: {stats.purchasesCount > 0 
                  ? `${(stats.totalRevenue / stats.purchasesCount).toFixed(2)} ₽` 
                  : '0 ₽'}
              </p>
              <p>
                • Покупок на пользователя: {stats.usersCount > 0
                  ? (stats.purchasesCount / stats.usersCount).toFixed(2)
                  : '0'}
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              Динамика продаж
            </h3>
            
            <Tabs defaultValue="days" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="days">По дням (30 дней)</TabsTrigger>
                <TabsTrigger value="weeks">По неделям (12 недель)</TabsTrigger>
              </TabsList>

              <TabsContent value="days" className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Количество покупок</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
                        formatter={(value: number) => [`${value} шт`, 'Покупок']}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Выручка</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
                        formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="weeks" className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Количество покупок</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.salesByWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week"
                        tickFormatter={(value) => `Нед. ${new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => `Неделя ${new Date(value).toLocaleDateString('ru-RU')}`}
                        formatter={(value: number) => [`${value} шт`, 'Покупок']}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Выручка</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.salesByWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week"
                        tickFormatter={(value) => `Нед. ${new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => `Неделя ${new Date(value).toLocaleDateString('ru-RU')}`}
                        formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
};

export default Dashboard;