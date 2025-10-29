import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { AgeWarningDialog } from './AgeWarningDialog';
import { useAuth } from '@/contexts/AuthContext';

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  cover: string;
  genre: string;
  description: string;
  rating: number;
  isAdultContent?: boolean;
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
  const navigate = useNavigate();
  const { isAdmin: authIsAdmin } = useAuth();
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [confirmedAdultBooks, setConfirmedAdultBooks] = useState<number[]>(() => {
    const saved = localStorage.getItem('confirmed_adult_books');
    return saved ? JSON.parse(saved) : [];
  });

  const confirmAdultContent = () => {
    const updatedConfirmed = [...confirmedAdultBooks, book.id];
    setConfirmedAdultBooks(updatedConfirmed);
    localStorage.setItem('confirmed_adult_books', JSON.stringify(updatedConfirmed));
  };

  const handleCardClick = () => {
    if (book.isAdultContent && !confirmedAdultBooks.includes(book.id) && !authIsAdmin) {
      setShowAgeWarning(true);
      return;
    }
    navigate(`/book/${book.id}`);
  };

  return (
    <>
      <AgeWarningDialog 
        open={showAgeWarning}
        onOpenChange={setShowAgeWarning}
        onAccept={confirmAdultContent}
        trackTitle={book.title}
      />
      <Card
        className={`group overflow-hidden hover-lift elegant-shadow transition-all duration-300 animate-fade-in flex flex-col relative ${
          book.isAdultContent && !confirmedAdultBooks.includes(book.id) && !authIsAdmin ? 'blur-sm' : ''
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {book.isAdultContent && !confirmedAdultBooks.includes(book.id) && !authIsAdmin && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] rounded-lg">
            <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-bold text-2xl shadow-lg">
              18+
            </div>
          </div>
        )}
      <div 
        className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 touch-manipulation rounded-t-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={book.cover}
          alt={book.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {book.isAdultContent && (
            <Badge className="bg-destructive hover:bg-destructive text-destructive-foreground text-xs px-2 py-0.5 font-bold">
              18+
            </Badge>
          )}
          {book.badges && book.badges.length > 0 && book.badges.map((badge) => (
            <Badge 
              key={badge} 
              className={
                badge === 'Новинка' ? 'bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-0.5' :
                badge === 'Популярное' ? 'bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-0.5' :
                badge === 'Бестселлер' ? 'bg-amber-500 hover:bg-amber-600 text-white text-xs px-2 py-0.5' :
                badge === 'Скидка' ? 'bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-0.5' :
                'text-xs px-2 py-0.5'
              }
            >
              {badge}
            </Badge>
          ))}
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          {isAdmin && onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity w-7 h-7 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book.id);
              }}
            >
              <Icon name="Trash2" size={14} />
            </Button>
          )}
          <Button
            size="icon"
            variant={isFavorite ? "default" : "secondary"}
            className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity w-7 h-7 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book.id);
            }}
          >
            <Icon name="Heart" size={14} fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
      
      <div className="p-3 space-y-2 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{book.description}</p>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Icon name="Star" size={12} className="text-yellow-500" fill="currentColor" />
            <span className="text-xs font-medium">{book.rating}</span>
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0">{book.genre}</Badge>
        </div>
        
        <div className="flex items-center justify-between pt-1 gap-2">
          <span className="text-lg font-bold text-primary whitespace-nowrap">{book.price} ₽</span>
          <Button size="sm" onClick={() => onAddToCart(book)} className="h-8 text-xs px-3">
            <Icon name="ShoppingCart" size={12} className="mr-1" />
            Купить
          </Button>
        </div>
      </div>
      </Card>
    </>
  );
};