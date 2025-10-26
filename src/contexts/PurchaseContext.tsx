import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PurchaseItem {
  bookId: number;
  title: string;
  author: string;
  price: number;
  cover: string;
}

interface Purchase {
  id: string;
  userId: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'completed' | 'processing' | 'cancelled';
}

interface PurchaseContextType {
  purchases: Purchase[];
  addPurchase: (userId: string, items: PurchaseItem[]) => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: ReactNode }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const savedPurchases = localStorage.getItem('bookstore_purchases');
    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    }
  }, []);

  const addPurchase = (userId: string, items: PurchaseItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    
    const newPurchase: Purchase = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(7),
      userId,
      date: new Date().toISOString(),
      items,
      totalAmount,
      status: 'completed'
    };

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('bookstore_purchases', JSON.stringify(updatedPurchases));
  };

  const userPurchases = purchases;

  return (
    <PurchaseContext.Provider value={{ purchases: userPurchases, addPurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchases must be used within PurchaseProvider');
  }
  return context;
};
