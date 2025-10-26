import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import useEmblaCarousel from 'embla-carousel-react';

interface BannerCarouselProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const BannerCarousel = ({ timeLeft }: BannerCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative mb-8 group">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {/* Banner 1 */}
          <div className="flex-[0_0_100%] min-w-0">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-6 md:p-10 lg:p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-3 text-center lg:text-left">
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="animate-ping absolute h-3 w-3 rounded-full bg-yellow-300 opacity-75" />
                    <div className="h-3 w-3 rounded-full bg-yellow-300" />
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 pulse-ring">
                      🔥 Горячее предложение
                    </Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    Скидка до 50% на бестселлеры!
                  </h2>
                  <p className="text-base md:text-lg text-white/90">
                    Только сегодня — специальные цены на популярные книги
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 pulse-glow">
                      <Icon name="Sparkles" size={20} className="mr-2" />
                      Смотреть акции
                    </Button>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 md:py-3 border border-white/20">
                      <Icon name="Clock" size={20} className="text-white" />
                      <div className="flex items-center gap-1 text-white font-mono font-bold text-sm md:text-base">
                        <span className="bg-white/20 rounded px-1.5 md:px-2 py-1 min-w-[2rem] md:min-w-[2.5rem] text-center">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span className="animate-pulse">:</span>
                        <span className="bg-white/20 rounded px-1.5 md:px-2 py-1 min-w-[2rem] md:min-w-[2.5rem] text-center">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                        <span className="animate-pulse">:</span>
                        <span className="bg-white/20 rounded px-1.5 md:px-2 py-1 min-w-[2rem] md:min-w-[2.5rem] text-center">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative animate-float hidden lg:block">
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
          </div>

          {/* Banner 2 */}
          <div className="flex-[0_0_100%] min-w-0 pl-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 md:p-10 lg:p-12">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
              </div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-3 text-center lg:text-left">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    ⭐ Новинки месяца
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    Свежие поступления — 2024
                  </h2>
                  <p className="text-base md:text-lg text-white/90">
                    Откройте для себя последние книжные новинки
                  </p>
                  <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
                    <Icon name="BookOpen" size={20} className="mr-2" />
                    Посмотреть новинки
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <Icon name="TrendingUp" size={64} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner 3 */}
          <div className="flex-[0_0_100%] min-w-0 pl-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 p-6 md:p-10 lg:p-12">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px]" />
              </div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-3 text-center lg:text-left">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    📚 Бесплатная доставка
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    Доставка от 1000 ₽ бесплатно!
                  </h2>
                  <p className="text-base md:text-lg text-white/90">
                    Оформите заказ и получите книги на дом без оплаты доставки
                  </p>
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-white/90">
                    <Icon name="Truck" size={20} className="mr-2" />
                    Узнать подробнее
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <Icon name="Package" size={64} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
        onClick={scrollPrev}
      >
        <Icon name="ChevronLeft" size={24} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
        onClick={scrollNext}
      >
        <Icon name="ChevronRight" size={24} />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};
