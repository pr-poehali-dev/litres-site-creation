import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { exportToCSV, exportToExcel } from '@/utils/exportTracks';

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

interface ExportTracksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[];
  selectedTrackIds?: number[];
}

export const ExportTracksDialog = ({ 
  open, 
  onOpenChange, 
  tracks,
  selectedTrackIds
}: ExportTracksDialogProps) => {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      exportToCSV(tracks, selectedTrackIds);
      toast({
        title: "Успешно!",
        description: `Экспортировано ${selectedTrackIds && selectedTrackIds.length > 0 ? selectedTrackIds.length : tracks.length} треков в CSV`
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать в CSV",
        variant: "destructive"
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(tracks, selectedTrackIds);
      toast({
        title: "Успешно!",
        description: `Экспортировано ${selectedTrackIds && selectedTrackIds.length > 0 ? selectedTrackIds.length : tracks.length} треков в Excel`
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать в Excel",
        variant: "destructive"
      });
    }
  };

  const count = selectedTrackIds && selectedTrackIds.length > 0 ? selectedTrackIds.length : tracks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Download" size={24} className="text-primary" />
            Экспорт треков
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {selectedTrackIds && selectedTrackIds.length > 0
              ? `Будет экспортировано ${count} выбранных треков`
              : `Будет экспортировано ${count} треков`
            }
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleExportExcel}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                  <Icon name="FileSpreadsheet" size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Excel (.xlsx)</div>
                  <div className="text-xs text-muted-foreground">
                    Экспорт в формате Excel с форматированием
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleExportCSV}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                  <Icon name="FileText" size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">CSV (.csv)</div>
                  <div className="text-xs text-muted-foreground">
                    Универсальный формат для таблиц и баз данных
                  </div>
                </div>
              </div>
            </Button>
          </div>

          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Экспортируемые поля:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>ID трека</li>
              <li>Название и исполнитель</li>
              <li>Длительность, жанр, год</li>
              <li>Цена и маркировка 18+</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
