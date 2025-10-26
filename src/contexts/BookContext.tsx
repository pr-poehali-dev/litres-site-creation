import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  price: number;
  cover: string;
  description: string;
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

  useEffect(() => {
    const savedBooks = localStorage.getItem('bookstore_books');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bookstore_books', JSON.stringify(books));
  }, [books]);

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now(),
    };
    setBooks(prev => [...prev, newBook]);
  };

  const updateBook = (id: number, updatedData: Partial<Book>) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, ...updatedData } : book
    ));
  };

  const deleteBook = (id: number) => {
    setBooks(prev => prev.filter(book => book.id !== id));
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
