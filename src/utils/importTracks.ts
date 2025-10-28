import * as XLSX from 'xlsx';

interface ParsedTrack {
  title: string;
  artist: string;
  duration: string;
  genre?: string;
  year?: number;
  price?: number;
  isAdultContent?: boolean;
}

interface ImportResult {
  success: boolean;
  tracks: ParsedTrack[];
  errors: string[];
}

const validateTrack = (track: any, rowIndex: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!track.title || typeof track.title !== 'string' || track.title.trim() === '') {
    errors.push(`Строка ${rowIndex}: отсутствует название трека`);
  }
  
  if (!track.artist || typeof track.artist !== 'string' || track.artist.trim() === '') {
    errors.push(`Строка ${rowIndex}: отсутствует исполнитель`);
  }
  
  if (!track.duration || typeof track.duration !== 'string' || track.duration.trim() === '') {
    errors.push(`Строка ${rowIndex}: отсутствует длительность`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const normalizeTrack = (row: any): ParsedTrack => {
  const isAdult = row['18+'] === 'Да' || row['18+'] === 'да' || row['18+'] === true || row['18+'] === 1;
  
  return {
    title: String(row['Название'] || row.title || '').trim(),
    artist: String(row['Исполнитель'] || row.artist || '').trim(),
    duration: String(row['Длительность'] || row.duration || '').trim(),
    genre: row['Жанр'] || row.genre ? String(row['Жанр'] || row.genre).trim() : undefined,
    year: row['Год'] || row.year ? parseInt(String(row['Год'] || row.year)) : undefined,
    price: row['Цена (₽)'] || row.price !== undefined ? parseInt(String(row['Цена (₽)'] || row.price || 0)) : 0,
    isAdultContent: isAdult
  };
};

export const parseCSV = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          resolve({
            success: false,
            tracks: [],
            errors: ['Файл пустой или содержит только заголовки']
          });
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
        const tracks: ParsedTrack[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          
          const normalizedTrack = normalizeTrack(row);
          const validation = validateTrack(normalizedTrack, i + 1);
          
          if (validation.valid) {
            tracks.push(normalizedTrack);
          } else {
            errors.push(...validation.errors);
          }
        }
        
        resolve({
          success: tracks.length > 0,
          tracks,
          errors
        });
      } catch (error) {
        resolve({
          success: false,
          tracks: [],
          errors: ['Ошибка парсинга CSV файла: ' + (error instanceof Error ? error.message : 'неизвестная ошибка')]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        tracks: [],
        errors: ['Ошибка чтения файла']
      });
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

export const parseExcel = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        if (rows.length === 0) {
          resolve({
            success: false,
            tracks: [],
            errors: ['Файл пустой или не содержит данных']
          });
          return;
        }
        
        const tracks: ParsedTrack[] = [];
        const errors: string[] = [];
        
        rows.forEach((row: any, index) => {
          const normalizedTrack = normalizeTrack(row);
          const validation = validateTrack(normalizedTrack, index + 2);
          
          if (validation.valid) {
            tracks.push(normalizedTrack);
          } else {
            errors.push(...validation.errors);
          }
        });
        
        resolve({
          success: tracks.length > 0,
          tracks,
          errors
        });
      } catch (error) {
        resolve({
          success: false,
          tracks: [],
          errors: ['Ошибка парсинга Excel файла: ' + (error instanceof Error ? error.message : 'неизвестная ошибка')]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        tracks: [],
        errors: ['Ошибка чтения файла']
      });
    };
    
    reader.readAsBinaryString(file);
  });
};
