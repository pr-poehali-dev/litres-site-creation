import * as XLSX from 'xlsx';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  audioUrl: string;
  genre?: string;
  year?: number;
  price?: number;
  isAdultContent?: boolean;
}

export const exportToCSV = (tracks: Track[], selectedIds?: number[]) => {
  const tracksToExport = selectedIds && selectedIds.length > 0
    ? tracks.filter(t => selectedIds.includes(t.id))
    : tracks;

  const headers = ['ID', 'Название', 'Исполнитель', 'Длительность', 'Жанр', 'Год', 'Цена (₽)', '18+'];
  
  const csvRows = [
    headers.join(','),
    ...tracksToExport.map(track => [
      track.id,
      `"${track.title.replace(/"/g, '""')}"`,
      `"${track.artist.replace(/"/g, '""')}"`,
      track.duration,
      track.genre ? `"${track.genre.replace(/"/g, '""')}"` : '',
      track.year || '',
      track.price !== undefined ? track.price : 0,
      track.isAdultContent ? 'Да' : 'Нет'
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `tracks_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (tracks: Track[], selectedIds?: number[]) => {
  const tracksToExport = selectedIds && selectedIds.length > 0
    ? tracks.filter(t => selectedIds.includes(t.id))
    : tracks;

  const data = tracksToExport.map(track => ({
    'ID': track.id,
    'Название': track.title,
    'Исполнитель': track.artist,
    'Длительность': track.duration,
    'Жанр': track.genre || '',
    'Год': track.year || '',
    'Цена (₽)': track.price !== undefined ? track.price : 0,
    '18+': track.isAdultContent ? 'Да' : 'Нет'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const columnWidths = [
    { wch: 5 },
    { wch: 30 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 }
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Треки');

  XLSX.writeFile(workbook, `tracks_${new Date().toISOString().split('T')[0]}.xlsx`);
};
