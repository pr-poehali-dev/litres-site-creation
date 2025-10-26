import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  cover: string;
  genre: string;
  description: string;
  rating: number;
}

interface BookCardProps {
  book: Book;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (bookId: number) => void;
  onAddToCart: (book: Book) => void;
  onDelete?: (bookId: number) => void;
  isAdmin?: boolean;
}

export const BookCard = ({ book, index, isFavorite, onToggleFavorite, onAddToCart, onDelete, isAdmin }: BookCardProps) => {
  return (
    <Card
      className="group overflow-hidden hover-lift elegant-shadow transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-white shimmer-effect touch-manipulation">
        <img
          src={book.cover}
          alt={book.title}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-300" />
        
        {book.badges && book.badges.length > 0 && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1">
            {book.badges.map((badge) => (
              <Badge 
                key={badge} 
                className={
                  badge === 'Новинка' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                  badge === 'Популярное' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                  badge === 'Бестселлер' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                  badge === 'Скидка' ? 'bg-red-500 hover:bg-red-600 text-white' :
                  ''
                }
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex gap-1 md:gap-2">
          {isAdmin && onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity w-8 h-8 md:w-10 md:h-10"
              onClick={() => onDelete(book.id)}
            >
              <Icon name="Trash2" size={16} className="md:w-[18px] md:h-[18px]" />
            </Button>
          )}
          <Button
            size="icon"
            variant={isFavorite ? "default" : "secondary"}
            className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity pulse-glow w-8 h-8 md:w-10 md:h-10"
            onClick={() => onToggleFavorite(book.id)}
          >
            <Icon name="Heart" size={16} className="md:w-[18px] md:h-[18px]" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div>
          <h3 className="font-semibold text-base md:text-lg line-clamp-1 mb-0.5 md:mb-1">{book.title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{book.author}</p>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{book.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 pulse-ring">
            <Icon name="Star" size={14} className="text-yellow-500 md:w-4 md:h-4" fill="currentColor" />
            <span className="text-xs md:text-sm font-medium">{book.rating}</span>
          </div>
          <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
        </div>
        <div className="flex items-center justify-between pt-1 md:pt-2 gap-2">
          <span className="text-lg md:text-xl font-bold text-primary pulse-ring whitespace-nowrap">{book.price} ₽</span>
          <Button size="sm" onClick={() => onAddToCart(book)} className="pulse-glow flex-shrink-0">
            <Icon name="ShoppingCart" size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">Купить</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};