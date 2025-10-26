import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    const users = JSON.parse(localStorage.getItem('bookstore_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const isAdmin = foundUser.email === 'swi79@bk.ru';
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        isAdmin
      };
      setUser(userData);
      localStorage.setItem('bookstore_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('bookstore_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    const isAdmin = email === 'swi79@bk.ru';
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      isAdmin
    };

    users.push(newUser);
    localStorage.setItem('bookstore_users', JSON.stringify(users));

    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isAdmin
    };
    setUser(userData);
    localStorage.setItem('bookstore_user', JSON.stringify(userData));
    return true;
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