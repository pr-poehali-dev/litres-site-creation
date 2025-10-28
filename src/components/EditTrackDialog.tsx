import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMusic } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

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

interface EditTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track | null;
}

export const EditTrackDialog = ({ open, onOpenChange, track }: EditTrackDialogProps) => {
  const { updateTrack } = useMusic();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    duration: '',
    cover: '',
    audioUrl: '',
    genre: '',
    year: new Date().getFullYear(),
    price: 0,
    isAdultContent: false
  });

  useEffect(() => {
    if (track) {
      setFormData({
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        cover: track.cover,
        audioUrl: track.audioUrl,
        genre: track.genre || '',
        year: track.year || new Date().getFullYear(),
        price: track.price || 0,
        isAdultContent: track.isAdultContent || false
      });
    }
  }, [track]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, cover: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 3 MB",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, audioUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!track || !formData.title || !formData.artist || !formData.audioUrl) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: название, исполнитель и аудио файл",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateTrack(track.id, formData);
      
      toast({
        title: "Успешно!",
        description: "Трек обновлен"
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating track:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при обновлении трека. Попробуйте снова.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Edit" size={24} className="text-primary" />
            Редактировать трек
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название трека *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название композиции"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Исполнитель *</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                placeholder="Имя исполнителя"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Жанр</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Поп, Рок, Джаз..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Год</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                placeholder="2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Длительность</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="3:45"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Укажите 0 для бесплатного трека
              </p>
            </div>

            <div className="space-y-2 flex items-center gap-2 pt-6">
              <Checkbox 
                id="isAdultContent"
                checked={formData.isAdultContent}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdultContent: checked as boolean })}
              />
              <Label htmlFor="isAdultContent" className="cursor-pointer flex items-center gap-2">
                <Icon name="AlertTriangle" size={16} className="text-destructive" />
                <span>Контент 18+</span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Обложка</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
              />
              <p className="text-xs text-muted-foreground">
                Выберите новое изображение или оставьте текущее
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Аудио файл *</Label>
            <Input
              id="audioUrl"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
            />
            <p className="text-xs text-muted-foreground">
              Выберите новый аудио файл или оставьте текущий (до 3 MB)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
