import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

export const exportToPDF = (purchases: Purchase[], userName: string) => {
  const doc = new jsPDF();
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('История покупок', 14, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Пользователь: ${userName}`, 14, 28);
  doc.text(`Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`, 14, 34);
  
  const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalBooks = purchases.reduce((sum, p) => sum + p.items.length, 0);
  doc.text(`Всего заказов: ${purchases.length}`, 14, 40);
  doc.text(`Книг куплено: ${totalBooks}`, 14, 46);
  doc.text(`Общая сумма: ${totalSpent} ₽`, 14, 52);

  const tableData = purchases.flatMap(purchase => 
    purchase.items.map((item, index) => [
      index === 0 ? `#${purchase.id.slice(0, 8)}` : '',
      index === 0 ? new Date(purchase.date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) : '',
      item.title,
      item.author,
      `${item.price} ₽`,
      index === 0 ? `${purchase.totalAmount} ₽` : '',
    ])
  );

  autoTable(doc, {
    startY: 60,
    head: [['Заказ', 'Дата', 'Книга', 'Автор', 'Цена', 'Итого']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
  });

  doc.save(`purchases_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (purchases: Purchase[], userName: string) => {
  const data = purchases.flatMap(purchase =>
    purchase.items.map((item, index) => ({
      'Номер заказа': index === 0 ? `#${purchase.id.slice(0, 8)}` : '',
      'Дата': index === 0 ? new Date(purchase.date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : '',
      'Статус': index === 0 ? (
        purchase.status === 'completed' ? 'Выполнен' :
        purchase.status === 'processing' ? 'В обработке' :
        'Отменен'
      ) : '',
      'Название книги': item.title,
      'Автор': item.author,
      'Цена': item.price,
      'Итого по заказу': index === 0 ? purchase.totalAmount : '',
    }))
  );

  const summaryData = [
    { 'Информация': 'Пользователь', 'Значение': userName },
    { 'Информация': 'Дата экспорта', 'Значение': new Date().toLocaleDateString('ru-RU') },
    { 'Информация': 'Всего заказов', 'Значение': purchases.length },
    { 'Информация': 'Книг куплено', 'Значение': purchases.reduce((sum, p) => sum + p.items.length, 0) },
    { 'Информация': 'Общая сумма', 'Значение': `${purchases.reduce((sum, p) => sum + p.totalAmount, 0)} ₽` },
  ];

  const wb = XLSX.utils.book_new();
  
  const ws1 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Сводка');
  
  const ws2 = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws2, 'История покупок');

  ws1['!cols'] = [{ wch: 20 }, { wch: 30 }];
  ws2['!cols'] = [
    { wch: 15 },
    { wch: 18 },
    { wch: 12 },
    { wch: 40 },
    { wch: 25 },
    { wch: 10 },
    { wch: 15 },
  ];

  XLSX.writeFile(wb, `purchases_${new Date().toISOString().split('T')[0]}.xlsx`);
};
