import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import funcUrls from '../../backend/func2url.json';

export interface BookFormat {
  format: string;
  fileUrl: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  price: number;
  discountPrice?: number;
  cover: string;
  description: string;
  formats: BookFormat[];
  badges?: string[];
  ebookText?: string;
  ebookPrice?: number;
  isAdultContent?: boolean;
  bonusAmount?: number;
  canPayWithBonus?: boolean;
}

interface BookContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: number, book: Partial<Book>) => void;
  deleteBook: (id: number) => void;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  rateBook: (bookId: number, rating: number) => void;
  getUserRating: (bookId: number) => number;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userRatings, setUserRatings] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('book_ratings');
    return saved ? JSON.parse(saved) : {};
  });

  const fetchBooks = async () => {
    try {
      const response = await fetch(funcUrls.books);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (book: Omit<Book, 'id'>) => {
    try {
      const response = await fetch(funcUrls.books, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      const data = await response.json();
      await fetchBooks();
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  const updateBook = async (id: number, updatedData: Partial<Book>) => {
    try {
      const bookToUpdate = books.find(b => b.id === id);
      if (!bookToUpdate) return;
      
      const response = await fetch(funcUrls.books, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookToUpdate, ...updatedData, id })
      });
      await fetchBooks();
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      await fetch(`${funcUrls.books}?id=${id}`, { method: 'DELETE' });
      await fetchBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id) 
        : [...prev, id]
    );
  };

  const isFavorite = (id: number) => {
    return favorites.includes(id);
  };

  const rateBook = (bookId: number, rating: number) => {
    const updatedRatings = { ...userRatings, [bookId]: rating };
    setUserRatings(updatedRatings);
    localStorage.setItem('book_ratings', JSON.stringify(updatedRatings));
  };

  const getUserRating = (bookId: number) => {
    return userRatings[bookId] || 0;
  };

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, deleteBook, toggleFavorite, isFavorite, rateBook, getUserRating }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within BookProvider');
  }
  return context;
};