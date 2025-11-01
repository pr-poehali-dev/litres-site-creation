import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useToast } from '@/hooks/use-toast';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired: () => void;
}

export const CartDrawer = ({ open, onOpenChange, onAuthRequired }: CartDrawerProps) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, totalAmount, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { addPurchase } = usePurchases();
  const { toast } = useToast();
  const [useBonus, setUseBonus] = useState(false);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [bonusToUse, setBonusToUse] = useState(0);

  const canUseBonus = cart.some(item => item.canPayWithBonus);

  useEffect(() => {
    if (user?.email) {
      const userBonusData = localStorage.getItem(`bonusCard_${user.email}`);
      if (userBonusData) {
        const data = JSON.parse(userBonusData);
        setBonusBalance(data.balance || 0);
      }
    }
  }, [user, open]);

  useEffect(() => {
    if (useBonus && canUseBonus) {
      const maxBonusUse = Math.min(bonusBalance, totalAmount);
      setBonusToUse(maxBonusUse);
    } else {
      setBonusToUse(0);
    }
  }, [useBonus, bonusBalance, totalAmount, canUseBonus]);

  const finalAmount = totalAmount - bonusToUse;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      onOpenChange(false);
      onAuthRequired();
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Корзина пуста',
        description: 'Добавьте книги в корзину перед оформлением',
        variant: 'destructive',
      });
      return;
    }

    const purchaseItems = cart.map(item => ({
      bookId: item.id,
      title: item.title,
      author: item.author,
      price: item.price,
      cover: item.cover,
    }));

    addPurchase(user!.id, purchaseItems);

    const userBonusData = localStorage.getItem(`bonusCard_${user!.email}`);
    const bonusData = userBonusData ? JSON.parse(userBonusData) : { balance: 0, cardNumber: '', transactions: [] };

    let newBalance = bonusData.balance || 0;
    const transactions = bonusData.transactions || [];

    if (useBonus && bonusToUse > 0) {
      newBalance -= bonusToUse;
      transactions.push({
        id: Date.now().toString() + '-spend',
        date: new Date().toISOString(),
        type: 'spend',
        amount: bonusToUse,
        description: `Оплата заказа (${itemCount} ${itemCount === 1 ? 'книга' : itemCount < 5 ? 'книги' : 'книг'})`,
      });
    }

    const earnedBonus = cart.reduce((sum, item) => sum + (item.bonusAmount || 0), 0);
    if (earnedBonus > 0) {
      newBalance += earnedBonus;
      transactions.push({
        id: Date.now().toString() + '-earn',
        date: new Date().toISOString(),
        type: 'earn',
        amount: earnedBonus,
        description: `Бонус за покупку (${itemCount} ${itemCount === 1 ? 'книга' : itemCount < 5 ? 'книги' : 'книг'})`,
      });
    }

    bonusData.balance = newBalance;
    bonusData.transactions = transactions;
    localStorage.setItem(`bonusCard_${user!.email}`, JSON.stringify(bonusData));

    clearCart();
    
    const bonusMessages = [];
    if (useBonus && bonusToUse > 0) {
      bonusMessages.push(`Списано ${bonusToUse} ₽ бонусов`);
    }
    if (earnedBonus > 0) {
      bonusMessages.push(`Начислено ${earnedBonus} ₽ бонусов`);
    }

    toast({
      title: 'Покупка оформлена!',
      description: `Вы успешно приобрели ${itemCount} ${itemCount === 1 ? 'книгу' : itemCount < 5 ? 'книги' : 'книг'} на сумму ${finalAmount} ₽${bonusMessages.length > 0 ? '. ' + bonusMessages.join('. ') : ''}`,
    });

    setUseBonus(false);
    setBonusToUse(0);
    onOpenChange(false);
    navigate('/profile');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={24} />
            Корзина
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Icon name="ShoppingCart" size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Корзина пуста</h3>
            <p className="text-muted-foreground text-center mb-6">
              Добавьте книги в корзину, чтобы оформить заказ
            </p>
            <Button onClick={() => onOpenChange(false)}>
              <Icon name="Library" size={18} className="mr-2" />
              Перейти в каталог
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2 mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                      <p className="text-lg font-bold text-primary">{item.price} ₽</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Icon name="Trash2" size={18} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              {canUseBonus && bonusBalance > 0 && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="useBonus"
                    checked={useBonus}
                    onCheckedChange={(checked) => setUseBonus(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="useBonus"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Оплатить бонусами
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Доступно: {bonusBalance} ₽
                    </p>
                  </div>
                  {useBonus && bonusToUse > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">-{bonusToUse} ₽</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Сумма:</span>
                  <span>{totalAmount} ₽</span>
                </div>
                {useBonus && bonusToUse > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Бонусы:</span>
                    <span className="text-primary">-{bonusToUse} ₽</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">К оплате:</span>
                  <span className="font-bold text-primary text-2xl">{finalAmount} ₽</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  <Icon name="CreditCard" size={20} className="mr-2" />
                  Оформить заказ
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    clearCart();
                    toast({
                      title: 'Корзина очищена',
                      description: 'Все товары удалены из корзины',
                    });
                  }}
                >
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Очистить корзину
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};