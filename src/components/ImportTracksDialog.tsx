import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { parseCSV, parseExcel } from '@/utils/importTracks';
import { useMusic } from '@/contexts/MusicContext';

interface ImportTracksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportTracksDialog = ({ open, onOpenChange }: ImportTracksDialogProps) => {
  const { addTrack } = useMusic();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setErrors(['Поддерживаются только файлы CSV и Excel (.xlsx, .xls)']);
      setFile(null);
      return;
    }

    try {
      const result = fileExtension === 'csv' 
        ? await parseCSV(selectedFile)
        : await parseExcel(selectedFile);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      setPreviewData(result.tracks.slice(0, 5));
      
      if (result.errors.length > 0) {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors(['Ошибка при обработке файла']);
      console.error('File parsing error:', error);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const result = fileExtension === 'csv' 
        ? await parseCSV(file)
        : await parseExcel(file);

      if (!result.success || result.tracks.length === 0) {
        toast({
          title: "Ошибка",
          description: result.errors[0] || "Не удалось импортировать треки",
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const track of result.tracks) {
        try {
          await addTrack({
            ...track,
            cover: '',
            audioUrl: 'data:audio/mpeg;base64,placeholder'
          });
          successCount++;
        } catch (error) {
          failCount++;
          console.error('Error adding track:', track, error);
        }
      }

      toast({
        title: "Импорт завершен!",
        description: `Успешно: ${successCount}, Ошибок: ${failCount}`
      });

      setFile(null);
      setPreviewData([]);
      setErrors([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при импорте",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Upload" size={24} className="text-primary" />
            Импорт треков из файла
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-file">Выберите файл CSV или Excel</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              Поддерживаются форматы: CSV, XLSX, XLS
            </p>
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <Icon name="AlertCircle" size={18} className="text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-destructive mb-1">
                    Обнаружены ошибки ({errors.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-xs text-destructive/90">
                        • {error}
                      </p>
                    ))}
                    {errors.length > 10 && (
                      <p className="text-xs text-destructive/70 italic">
                        И ещё {errors.length - 10} ошибок...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Icon name="Eye" size={16} className="text-primary" />
                Предпросмотр (первые 5 треков)
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Название</th>
                        <th className="px-3 py-2 text-left font-semibold">Исполнитель</th>
                        <th className="px-3 py-2 text-left font-semibold">Длительность</th>
                        <th className="px-3 py-2 text-left font-semibold">Жанр</th>
                        <th className="px-3 py-2 text-left font-semibold">Год</th>
                        <th className="px-3 py-2 text-left font-semibold">Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((track, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{track.title}</td>
                          <td className="px-3 py-2">{track.artist}</td>
                          <td className="px-3 py-2">{track.duration}</td>
                          <td className="px-3 py-2">{track.genre || '-'}</td>
                          <td className="px-3 py-2">{track.year || '-'}</td>
                          <td className="px-3 py-2">{track.price !== undefined ? `${track.price} ₽` : '0 ₽'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Icon name="Info" size={16} className="text-primary" />
              Формат файла
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Файл должен содержать следующие колонки:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li><strong>Название</strong> (обязательно)</li>
                <li><strong>Исполнитель</strong> (обязательно)</li>
                <li><strong>Длительность</strong> (обязательно, например: 3:45)</li>
                <li>Жанр, Год, Цена (₽), 18+ (опционально)</li>
              </ul>
              <p className="pt-2 italic">
                ⚠️ После импорта нужно будет добавить обложки и аудиофайлы вручную через редактирование
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || previewData.length === 0 || importing}
            >
              {importing ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Импортирую...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={18} className="mr-2" />
                  Импортировать
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
