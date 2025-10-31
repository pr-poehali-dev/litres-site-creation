import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
  {
    id: 'month',
    name: '1 месяц',
    price: 399,
    period: 'месяц',
    features: [
      'Неограниченное скачивание музыки',
      'Высокое качество до 320 kbps',
      'Доступ ко всем альбомам',
      'Без рекламы',
      'Офлайн прослушивание',
      'Создание плейлистов'
    ],
    popular: false
  },
  {
    id: 'half-year',
    name: '6 месяцев',
    price: 1999,
    originalPrice: 2394,
    period: 'полгода',
    savings: '17%',
    features: [
      'Неограниченное скачивание музыки',
      'Высокое качество до 320 kbps',
      'Доступ ко всем альбомам',
      'Без рекламы',
      'Офлайн прослушивание',
      'Создание плейлистов',
      'Эксклюзивные релизы',
      'Приоритетная загрузка'
    ],
    popular: true
  },
  {
    id: 'year',
    name: '12 месяцев',
    price: 2999,
    originalPrice: 4788,
    period: 'год',
    savings: '37%',
    features: [
      'Неограниченное скачивание музыки',
      'Высокое качество до 320 kbps',
      'Доступ ко всем альбомам',
      'Без рекламы',
      'Офлайн прослушивание',
      'Создание плейлистов',
      'Эксклюзивные релизы',
      'Приоритетная загрузка',
      'Lossless качество FLAC',
      'Ранний доступ к новинкам'
    ],
    popular: false
  }
];

export const Gold = () => {
  const [selectedPlan, setSelectedPlan] = useState('half-year');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 mb-6">
            <Icon name="Award" size={40} className="text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gold подписка</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Безграничный доступ к музыкальной библиотеке. Скачивайте и слушайте без ограничений
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                selectedPlan === plan.id ? 'border-yellow-500 shadow-xl' : ''
              } ${plan.popular ? 'border-yellow-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Популярный
                </div>
              )}
              {plan.savings && (
                <div className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Выгода {plan.savings}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-4 mb-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through mr-2">
                        {plan.originalPrice} ₽
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground">{plan.price} ₽</span>
                  </div>
                  <span className="text-sm text-muted-foreground">за {plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Icon name="Check" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Выбрано' : 'Выбрать план'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 mb-3">
                    <Icon name="Music" size={24} className="text-yellow-500" />
                  </div>
                  <h3 className="font-semibold mb-2">100,000+ треков</h3>
                  <p className="text-sm text-muted-foreground">Огромная коллекция музыки</p>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 mb-3">
                    <Icon name="Download" size={24} className="text-yellow-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Без ограничений</h3>
                  <p className="text-sm text-muted-foreground">Скачивайте сколько угодно треков</p>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 mb-3">
                    <Icon name="Headphones" size={24} className="text-yellow-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Премиум качество</h3>
                  <p className="text-sm text-muted-foreground">До 320 kbps и FLAC</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button size="lg" className="px-12 bg-yellow-500 hover:bg-yellow-600 text-white">
              <Icon name="CreditCard" size={20} className="mr-2" />
              Оформить подписку
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Безопасная оплата. Отменить можно в любой момент
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gold;
