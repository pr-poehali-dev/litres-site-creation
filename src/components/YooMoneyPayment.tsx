import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Book } from '@/contexts/BookContext';
import funcUrls from '../../backend/func2url.json';
import Icon from '@/components/ui/icon';

interface YooMoneyPaymentProps {
  book: Book;
  purchaseType?: 'download' | 'read';
  onSuccess?: () => void;
}

export const YooMoneyPayment = ({ book, purchaseType = 'download', onSuccess }: YooMoneyPaymentProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      alert('Войдите в систему для оплаты');
      return;
    }

    setLoading(true);

    try {
      const price = purchaseType === 'read' && book.ebookPrice 
        ? book.ebookPrice 
        : book.discountPrice || book.price;

      const url = `${funcUrls.books}/yoomoney-form?bookId=${book.id}&userEmail=${user.email}&amount=${price}&purchaseType=${purchaseType}`;
      console.log('Requesting payment data:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        alert(`Ошибка сервера: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Payment data received:', data);

      if (data.error) {
        console.error('Payment data error:', data.error);
        alert('Ошибка создания платежа: ' + data.error);
        setLoading(false);
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.formUrl;

      const fields = {
        receiver: data.receiver,
        'quickpay-form': data.quickpay_form,
        targets: data.targets,
        paymentType: data.paymentType,
        sum: data.sum,
        label: data.label,
        successURL: data.successURL
      };

      console.log('Submitting form with fields:', fields);

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert('Не удалось создать платеж');
    } finally {
      setLoading(false);
    }
  };

  const price = purchaseType === 'read' && book.ebookPrice 
    ? book.ebookPrice 
    : book.discountPrice || book.price;

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
          Загрузка...
        </>
      ) : (
        <>
          <Icon name="CreditCard" className="mr-2 h-4 w-4" />
          Оплатить {price} ₽
        </>
      )}
    </Button>
  );
};