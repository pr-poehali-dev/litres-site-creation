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
  cover: string;
  description: string;
  formats: BookFormat[];
  badges?: string[];
  ebookText?: string;
  ebookPrice?: number;
  isAdultContent?: boolean;
}

interface BookContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: number, book: Partial<Book>) => void;
  deleteBook: (id: number) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, deleteBook }}>
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