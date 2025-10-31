import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AudioAd {
  id: string;
  name: string;
  url: string;
  duration: number;
  uploadDate: string;
}

export const AudioAds = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [audioAds, setAudioAds] = useState<AudioAd[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const savedAds = localStorage.getItem('audioAds');
    if (savedAds) {
      setAudioAds(JSON.parse(savedAds));
    }
  }, [isAdmin, navigate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите аудио файл',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.onloadedmetadata = () => {
      const duration = audio.duration;

      if (duration > 30) {
        toast({
          title: 'Ошибка',
          description: 'Аудио реклама не должна превышать 30 секунд',
          variant: 'destructive',
        });
        setIsUploading(false);
        URL.revokeObjectURL(url);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newAd: AudioAd = {
          id: Date.now().toString(),
          name: file.name,
          url: event.target?.result as string,
          duration: duration,
          uploadDate: new Date().toISOString(),
        };

        const updatedAds = [...audioAds, newAd];
        setAudioAds(updatedAds);
        localStorage.setItem('audioAds', JSON.stringify(updatedAds));
        
        toast({
          title: 'Успешно',
          description: 'Аудио реклама добавлена',
        });
        
        setIsUploading(false);
        URL.revokeObjectURL(url);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    };

    audio.src = url;
  };

  const handleDelete = (id: string) => {
    const updatedAds = audioAds.filter(ad => ad.id !== id);
    setAudioAds(updatedAds);
    localStorage.setItem('audioAds', JSON.stringify(updatedAds));
    
    toast({
      title: 'Успешно',
      description: 'Аудио реклама удалена',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Управление аудио рекламой</h1>
          <p className="text-muted-foreground">
            Загружайте аудио рекламу, которая будет случайно воспроизводиться при прослушивании музыки
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Добавить новую рекламу</CardTitle>
            <CardDescription>
              Максимальная длительность: 30 секунд. Поддерживаемые форматы: MP3, WAV, OGG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              <Icon name={isUploading ? 'Loader2' : 'Upload'} size={20} className={`mr-2 ${isUploading ? 'animate-spin' : ''}`} />
              {isUploading ? 'Загрузка...' : 'Выбрать аудио файл'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Активные рекламы ({audioAds.length})</h2>
          
          {audioAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon name="Music" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Нет загруженных аудио реклам.<br />
                  Добавьте первую рекламу, чтобы она начала воспроизводиться.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {audioAds.map((ad) => (
                <Card key={ad.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Volume2" size={24} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{ad.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {formatDuration(ad.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {formatDate(ad.uploadDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <audio ref={audioRef} src={ad.url} className="hidden" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const audio = new Audio(ad.url);
                          audio.play();
                        }}
                      >
                        <Icon name="Play" size={18} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Icon name="Trash2" size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioAds;
