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
}

export const BookCard = ({ book, index, isFavorite, onToggleFavorite, onAddToCart }: BookCardProps) => {
  return (
    <Card
      className="group overflow-hidden hover-lift elegant-shadow transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-white shimmer-effect">
        <img
          src={book.cover}
          alt={book.title}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Button
          size="icon"
          variant={isFavorite ? "default" : "secondary"}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pulse-glow"
          onClick={() => onToggleFavorite(book.id)}
        >
          <Icon name="Heart" size={18} fill={isFavorite ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 mb-1">{book.title}</h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 pulse-ring">
            <Icon name="Star" size={16} className="text-yellow-500" fill="currentColor" />
            <span className="text-sm font-medium">{book.rating}</span>
          </div>
          <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-primary pulse-ring">{book.price} ₽</span>
          <Button size="sm" onClick={() => onAddToCart(book)} className="pulse-glow">
            <Icon name="ShoppingCart" size={16} className="mr-2" />
            Купить
          </Button>
        </div>
      </div>
    </Card>
  );
};