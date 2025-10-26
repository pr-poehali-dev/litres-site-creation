import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useBooks } from '@/contexts/BookContext';

const MyBooks = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { addToCart } = useCart();
  const { books, toggleFavorite, isFavorite, deleteBook } = useBooks();
  
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  if (!isAdmin || user?.email !== 'swi79@bk.ru') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthDialogOpen={() => setIsAuthDialogOpen(true)}
        onCartOpen={() => setIsCartOpen(true)}
        onAddBookOpen={() => setIsAddBookOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Мои книги</h1>
          <p className="text-muted-foreground">Книги, которые вы добавили в систему</p>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">У вас пока нет книг</p>
            <p className="text-sm text-muted-foreground">Нажмите "Добавить книгу" чтобы начать</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {books.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                isFavorite={isFavorite(book.id)}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                onDelete={deleteBook}
                isAdmin={true}
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

      <AddBookDialog 
        isOpen={isAddBookOpen} 
        onClose={() => setIsAddBookOpen(false)} 
      />
    </div>
  );
};

export default MyBooks;
