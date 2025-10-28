import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useBooks } from '@/contexts/BookContext';

const NewReleases = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { books, toggleFavorite, isFavorite, deleteBook } = useBooks();
  
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  const newBooks = books.filter(book => 
    book.badges && book.badges.includes('Новинка')
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthDialogOpen={() => setIsAuthDialogOpen(true)}
        onCartOpen={() => setIsCartOpen(true)}
        onAddBookOpen={() => setIsAddBookOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Новинки</h1>
          <p className="text-muted-foreground">Самые свежие книги в нашей коллекции</p>
        </div>

        {newBooks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">Пока нет новинок</p>
            <p className="text-sm text-muted-foreground">Скоро здесь появятся свежие книги!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {newBooks.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                isFavorite={isFavorite(book.id)}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                onDelete={isAdmin ? deleteBook : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {isAdmin && (
        <AddBookDialog 
          isOpen={isAddBookOpen} 
          onClose={() => setIsAddBookOpen(false)} 
        />
      )}
      <MobileBottomNav />
    </div>
  );
};

export default NewReleases;