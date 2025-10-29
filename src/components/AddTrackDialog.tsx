import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMusic } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AddTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTrackDialog = ({ open, onOpenChange }: AddTrackDialogProps) => {
  const { addTrack } = useMusic();
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
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 2 MB",
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
    
    if (!formData.title || !formData.artist) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: название и исполнитель",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTrack(formData);
      
      toast({
        title: "Успешно!",
        description: "Трек добавлен в библиотеку"
      });

      setFormData({
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
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при сохранении трека. Попробуйте снова.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Music" size={24} className="text-primary" />
            Добавить трек
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
                Выберите изображение для обложки
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Аудио файл</Label>
            <Input
              id="audioUrl"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
            />
            <p className="text-xs text-muted-foreground">
              Выберите MP3 или другой аудио файл (до 2 MB). Можно добавить позже.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить трек
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};