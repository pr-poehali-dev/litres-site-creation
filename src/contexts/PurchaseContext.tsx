import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import funcUrls from '../../backend/func2url.json';

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
  addPurchase: (userId: string, items: PurchaseItem[]) => Promise<void>;
  hasPurchased: (userId: string, bookId: number) => boolean;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: ReactNode }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const fetchPurchases = async (userEmail: string) => {
    if (!userEmail) return;
    try {
      const response = await fetch(funcUrls.purchases, {
        headers: { 'X-User-Email': userEmail }
      });
      const data = await response.json();
      
      const formattedPurchases: Purchase[] = (data.purchases || []).map((p: any) => ({
        id: p.id.toString(),
        userId: userEmail,
        date: p.purchasedAt,
        items: [{
          bookId: p.bookId,
          title: p.book.title,
          author: p.book.author,
          price: p.price,
          cover: p.book.cover
        }],
        totalAmount: p.price,
        status: 'completed' as const
      }));
      
      setPurchases(formattedPurchases);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('bookstore_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserEmail(user.email);
      fetchPurchases(user.email);
    }
  }, []);

  const addPurchase = async (userId: string, items: PurchaseItem[]) => {
    try {
      for (const item of items) {
        await fetch(funcUrls.purchases, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userId
          },
          body: JSON.stringify({
            bookId: item.bookId,
            purchaseType: 'download',
            price: item.price
          })
        });
      }
      await fetchPurchases(userId);
    } catch (error) {
      console.error('Failed to add purchase:', error);
    }
  };

  const hasPurchased = (userId: string, bookId: number): boolean => {
    return purchases.some(
      purchase => 
        purchase.userId === userId && 
        purchase.status === 'completed' &&
        purchase.items.some(item => item.bookId === bookId)
    );
  };

  const userPurchases = purchases;

  return (
    <PurchaseContext.Provider value={{ purchases: userPurchases, addPurchase, hasPurchased }}>
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