import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AudioAd {
  id: string;
  name: string;
  url: string;
  duration: number;
  uploadDate: string;
  plays?: number;
  lastPlayed?: string;
}

export const AudioAds = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [audioAds, setAudioAds] = useState<AudioAd[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [adFrequency, setAdFrequency] = useState(3);
  const [adProbability, setAdProbability] = useState(30);
  const [totalPlays, setTotalPlays] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const savedAds = localStorage.getItem('audioAds');
    if (savedAds) {
      const ads = JSON.parse(savedAds);
      setAudioAds(ads);
      const total = ads.reduce((sum: number, ad: AudioAd) => sum + (ad.plays || 0), 0);
      setTotalPlays(total);
    }

    const savedFrequency = localStorage.getItem('adFrequency');
    if (savedFrequency) {
      setAdFrequency(parseInt(savedFrequency));
    }

    const savedProbability = localStorage.getItem('adProbability');
    if (savedProbability) {
      setAdProbability(parseInt(savedProbability));
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
    
    const total = updatedAds.reduce((sum, ad) => sum + (ad.plays || 0), 0);
    setTotalPlays(total);
    
    toast({
      title: 'Успешно',
      description: 'Аудио реклама удалена',
    });
  };

  const resetStatistics = () => {
    const resetAds = audioAds.map(ad => ({
      ...ad,
      plays: 0,
      lastPlayed: undefined,
    }));
    setAudioAds(resetAds);
    localStorage.setItem('audioAds', JSON.stringify(resetAds));
    setTotalPlays(0);
    
    toast({
      title: 'Успешно',
      description: 'Статистика сброшена',
    });
  };

  const handleFrequencyChange = (value: number[]) => {
    const newFrequency = value[0];
    setAdFrequency(newFrequency);
    localStorage.setItem('adFrequency', newFrequency.toString());
  };

  const handleProbabilityChange = (value: number[]) => {
    const newProbability = value[0];
    setAdProbability(newProbability);
    localStorage.setItem('adProbability', newProbability.toString());
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего показов</CardDescription>
              <CardTitle className="text-3xl">{totalPlays}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <Icon name="TrendingUp" size={14} className="mr-1" />
                Общая статистика
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Активных реклам</CardDescription>
              <CardTitle className="text-3xl">{audioAds.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <Icon name="Music" size={14} className="mr-1" />
                Доступно для показа
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Средний показ</CardDescription>
              <CardTitle className="text-3xl">
                {audioAds.length > 0 ? Math.round(totalPlays / audioAds.length) : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <Icon name="BarChart" size={14} className="mr-1" />
                На одну рекламу
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Настройки частоты рекламы</CardTitle>
            <CardDescription>
              Настройте, как часто будет воспроизводиться аудио реклама
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Воспроизводить рекламу каждые {adFrequency} {adFrequency === 1 ? 'трек' : adFrequency < 5 ? 'трека' : 'треков'}
                </Label>
              </div>
              <Slider
                id="frequency"
                value={[adFrequency]}
                onValueChange={handleFrequencyChange}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Диапазон: от каждого трека до каждого 10-го трека
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="probability" className="text-sm font-medium">
                  Вероятность показа: {adProbability}%
                </Label>
              </div>
              <Slider
                id="probability"
                value={[adProbability]}
                onValueChange={handleProbabilityChange}
                min={10}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Шанс воспроизведения рекламы в момент, когда достигнута частота
              </p>
            </div>
          </CardContent>
        </Card>

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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Активные рекламы ({audioAds.length})</h2>
            {totalPlays > 0 && (
              <Button variant="outline" size="sm" onClick={resetStatistics}>
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Сбросить статистику
              </Button>
            )}
          </div>
          
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
                        <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {formatDuration(ad.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {formatDate(ad.uploadDate)}
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            <Icon name="Activity" size={14} />
                            Показов: {ad.plays || 0}
                          </span>
                          {ad.lastPlayed && (
                            <span className="flex items-center gap-1 text-xs">
                              <Icon name="PlayCircle" size={14} />
                              Последний: {formatDate(ad.lastPlayed)}
                            </span>
                          )}
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