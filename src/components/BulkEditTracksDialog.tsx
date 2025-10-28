import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMusic } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface BulkEditTracksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrackIds: number[];
  onComplete: () => void;
}

export const BulkEditTracksDialog = ({ 
  open, 
  onOpenChange, 
  selectedTrackIds,
  onComplete 
}: BulkEditTracksDialogProps) => {
  const { updateTrack } = useMusic();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    genre: '',
    year: '',
    price: '',
    isAdultContent: false,
  });
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    genre: false,
    year: false,
    price: false,
    isAdultContent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasSelectedFields = Object.values(fieldsToUpdate).some(v => v);
    
    if (!hasSelectedFields) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одно поле для обновления",
        variant: "destructive"
      });
      return;
    }

    try {
      const updates: any = {};
      
      if (fieldsToUpdate.genre) updates.genre = formData.genre;
      if (fieldsToUpdate.year) updates.year = parseInt(formData.year) || new Date().getFullYear();
      if (fieldsToUpdate.price) updates.price = parseInt(formData.price) || 0;
      if (fieldsToUpdate.isAdultContent) updates.isAdultContent = formData.isAdultContent;

      for (const trackId of selectedTrackIds) {
        await updateTrack(trackId, updates);
      }
      
      toast({
        title: "Успешно!",
        description: `Обновлено треков: ${selectedTrackIds.length}`
      });

      setFormData({
        genre: '',
        year: '',
        price: '',
        isAdultContent: false,
      });
      setFieldsToUpdate({
        genre: false,
        year: false,
        price: false,
        isAdultContent: false,
      });
      
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error bulk updating tracks:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при обновлении треков. Попробуйте снова.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Edit3" size={24} className="text-primary" />
            Массовое редактирование ({selectedTrackIds.length} треков)
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Выберите поля, которые нужно обновить для всех выбранных треков
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="update-genre"
                checked={fieldsToUpdate.genre}
                onCheckedChange={(checked) => setFieldsToUpdate({ ...fieldsToUpdate, genre: checked as boolean })}
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="genre" className="cursor-pointer">
                  Жанр
                </Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => {
                    setFormData({ ...formData, genre: e.target.value });
                    setFieldsToUpdate({ ...fieldsToUpdate, genre: true });
                  }}
                  placeholder="Поп, Рок, Джаз..."
                  disabled={!fieldsToUpdate.genre}
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="update-year"
                checked={fieldsToUpdate.year}
                onCheckedChange={(checked) => setFieldsToUpdate({ ...fieldsToUpdate, year: checked as boolean })}
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="year" className="cursor-pointer">
                  Год
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => {
                    setFormData({ ...formData, year: e.target.value });
                    setFieldsToUpdate({ ...fieldsToUpdate, year: true });
                  }}
                  placeholder="2024"
                  disabled={!fieldsToUpdate.year}
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="update-price"
                checked={fieldsToUpdate.price}
                onCheckedChange={(checked) => setFieldsToUpdate({ ...fieldsToUpdate, price: checked as boolean })}
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="price" className="cursor-pointer">
                  Цена (₽)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    setFieldsToUpdate({ ...fieldsToUpdate, price: true });
                  }}
                  placeholder="0"
                  disabled={!fieldsToUpdate.price}
                />
                <p className="text-xs text-muted-foreground">
                  Укажите 0 для бесплатных треков
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Checkbox 
                id="update-adult"
                checked={fieldsToUpdate.isAdultContent}
                onCheckedChange={(checked) => setFieldsToUpdate({ ...fieldsToUpdate, isAdultContent: checked as boolean })}
              />
              <Label htmlFor="update-adult" className="cursor-pointer flex items-center gap-2">
                <Icon name="AlertTriangle" size={16} className="text-destructive" />
                <span>Пометить как контент 18+</span>
              </Label>
            </div>
            {fieldsToUpdate.isAdultContent && (
              <div className="ml-9 flex items-center gap-2">
                <Checkbox 
                  id="adult-content-value"
                  checked={formData.isAdultContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAdultContent: checked as boolean })}
                />
                <Label htmlFor="adult-content-value" className="cursor-pointer text-sm">
                  Да, это контент 18+
                </Label>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Save" size={18} className="mr-2" />
              Применить ко всем ({selectedTrackIds.length})
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
