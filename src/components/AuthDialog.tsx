import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;

      if (isLogin) {
        success = await login(email, password);
        if (success) {
          toast({
            title: 'Добро пожаловать!',
            description: 'Вы успешно вошли в систему',
          });
          onOpenChange(false);
          resetForm();
        } else {
          toast({
            title: 'Ошибка входа',
            description: 'Неверный email или пароль',
            variant: 'destructive',
          });
        }
      } else {
        if (!name) {
          toast({
            title: 'Ошибка',
            description: 'Пожалуйста, введите имя',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        success = await register(email, password, name);
        if (success) {
          toast({
            title: 'Регистрация успешна!',
            description: 'Добро пожаловать в Pulse Book',
          });
          onOpenChange(false);
          resetForm();
        } else {
          toast({
            title: 'Ошибка регистрации',
            description: 'Пользователь с таким email уже существует',
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                Загрузка...
              </>
            ) : (
              <>{isLogin ? 'Войти' : 'Зарегистрироваться'}</>
            )}
          </Button>
        </form>
        <div className="text-center text-sm">
          {isLogin ? (
            <p>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-medium"
              >
                Зарегистрироваться
              </button>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-medium"
              >
                Войти
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};