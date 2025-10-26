import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    year: new Date().getFullYear()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist || !formData.audioUrl) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: название, исполнитель и аудио файл",
        variant: "destructive"
      });
      return;
    }

    addTrack(formData);
    
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
      year: new Date().getFullYear()
    });
    
    onOpenChange(false);
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
              <Label htmlFor="cover">URL обложки</Label>
              <Input
                id="cover"
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">URL аудио файла *</Label>
            <Input
              id="audioUrl"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              placeholder="https://.../audio.mp3"
              required
            />
            <p className="text-xs text-muted-foreground">
              Добавьте ссылку на MP3 файл (можно использовать облачные сервисы)
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
