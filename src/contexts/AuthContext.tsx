import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import funcUrls from '../../backend/func2url.json';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('bookstore_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${funcUrls.auth}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      const data = await response.json();
      
      if (response.ok && data.user) {
        const isAdmin = data.user.isAdmin || data.user.email === 'swi79@bk.ru';
        const userData = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.name,
          isAdmin
        };
        setUser(userData);
        localStorage.setItem('bookstore_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch(funcUrls.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      
      const data = await response.json();
      
      if (response.ok && data.user) {
        const isAdmin = data.user.email === 'swi79@bk.ru';
        const userData = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.name,
          isAdmin
        };
        setUser(userData);
        localStorage.setItem('bookstore_user', JSON.stringify(userData));

        const cardNumber = generateCardNumber();
        const bonusCardData = {
          balance: 0,
          cardNumber,
          transactions: [],
        };
        localStorage.setItem(`bonusCard_${email}`, JSON.stringify(bonusCardData));

        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const generateCardNumber = () => {
    const prefix = '4276';
    const randomPart = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return `${prefix} ${randomPart.slice(0, 4)} ${randomPart.slice(4, 8)} ${randomPart.slice(8, 12)}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bookstore_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isAdmin: user?.isAdmin || false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};