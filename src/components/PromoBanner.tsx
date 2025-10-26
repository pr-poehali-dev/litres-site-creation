import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface PromoBannerProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const PromoBanner = ({ timeLeft }: PromoBannerProps) => {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-8 md:p-12 animate-shimmer">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="animate-ping absolute h-3 w-3 rounded-full bg-yellow-300 opacity-75" />
            <div className="h-3 w-3 rounded-full bg-yellow-300" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 pulse-ring">
              🔥 Горячее предложение
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Скидка до 50% на бестселлеры!
          </h2>
          <p className="text-lg text-white/90">
            Только сегодня — специальные цены на популярные книги. Не упустите шанс!
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 pulse-glow">
              <Icon name="Sparkles" size={20} className="mr-2" />
              Смотреть акции
            </Button>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <Icon name="Clock" size={20} className="text-white" />
              <div className="flex items-center gap-1 text-white font-mono font-bold">
                <span className="bg-white/20 rounded px-2 py-1 min-w-[2.5rem] text-center">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="animate-pulse">:</span>
                <span className="bg-white/20 rounded px-2 py-1 min-w-[2.5rem] text-center">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="animate-pulse">:</span>
                <span className="bg-white/20 rounded px-2 py-1 min-w-[2.5rem] text-center">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl" />
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-center space-y-2">
              <Icon name="Gift" size={48} className="text-white mx-auto" />
              <p className="text-6xl font-bold text-white">-50%</p>
              <p className="text-white/90 font-medium">на избранное</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
