import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { useMusic } from '@/contexts/MusicContext';

export const MusicPlayer = () => {
  const { currentTrack, isPlaying, setIsPlaying, tracks, setCurrentTrack } = useMusic();
  const audioRef = useRef<HTMLAudioElement>(null);
  const adAudioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [playCount, setPlayCount] = useState(0);
  const [isPlayingAd, setIsPlayingAd] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !analyserRef.current || !dataArrayRef.current) return;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const barCount = 24;
      const barWidth = canvas.width / barCount;
      const gap = 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
        let barHeight = (dataArrayRef.current[dataIndex] / 255) * canvas.height;
        
        if (!isPlaying) {
          barHeight = Math.random() * 10 + 5;
        }

        const x = i * barWidth;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        
        const hue = (i / barCount) * 60 + 260;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, 55%, 0.6)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + gap / 2, canvas.height - barHeight, barWidth - gap, barHeight);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentTrack) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));

    const isPaid = currentTrack.price && currentTrack.price > 0;
    const freePreview = currentTrack.freePreviewSeconds || 30;
    const purchasedTracks = JSON.parse(localStorage.getItem('purchased_tracks') || '[]');
    const isPurchased = purchasedTracks.includes(currentTrack.id);

    if (isPaid && !isPurchased && current >= freePreview) {
      audioRef.current.pause();
      setIsPlaying(false);
      alert(`Бесплатный превью закончен. Купите трек "${currentTrack.title}" за ${currentTrack.price} ₽ чтобы слушать полностью.`);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(formatTime(audioRef.current.duration));
  };

  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current) return;
    const time = (value[0] / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.volume = value[0] / 100;
    setVolume(value[0]);
  };

  const playRandomAd = () => {
    const audioAdsString = localStorage.getItem('audioAds');
    if (!audioAdsString) return false;

    const audioAds = JSON.parse(audioAdsString);
    if (!audioAds || audioAds.length === 0) return false;

    const probabilityString = localStorage.getItem('adProbability');
    const probability = probabilityString ? parseInt(probabilityString) / 100 : 0.3;
    
    const shouldPlayAd = Math.random() < probability;
    
    if (shouldPlayAd) {
      const randomIndex = Math.floor(Math.random() * audioAds.length);
      const randomAd = audioAds[randomIndex];
      
      if (adAudioRef.current && audioRef.current) {
        setIsPlayingAd(true);
        audioRef.current.pause();
        
        adAudioRef.current.src = randomAd.url;
        adAudioRef.current.volume = audioRef.current.volume;
        adAudioRef.current.play();

        const today = new Date().toISOString().split('T')[0];
        const playHistory = randomAd.playHistory || [];
        const todayEntry = playHistory.find(entry => entry.date === today);
        
        const updatedHistory = todayEntry
          ? playHistory.map(entry =>
              entry.date === today ? { ...entry, count: entry.count + 1 } : entry
            )
          : [...playHistory, { date: today, count: 1 }];

        audioAds[randomIndex] = {
          ...randomAd,
          plays: (randomAd.plays || 0) + 1,
          lastPlayed: new Date().toISOString(),
          playHistory: updatedHistory,
        };
        localStorage.setItem('audioAds', JSON.stringify(audioAds));
        
        return true;
      }
    }
    
    return false;
  };

  const handleNext = () => {
    if (!currentTrack) return;
    
    const newPlayCount = playCount + 1;
    setPlayCount(newPlayCount);

    const frequencyString = localStorage.getItem('adFrequency');
    const frequency = frequencyString ? parseInt(frequencyString) : 3;

    if (newPlayCount % frequency === 0) {
      if (playRandomAd()) {
        setTimeout(() => {
          const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
          const nextTrack = tracks[currentIndex + 1] || tracks[0];
          setCurrentTrack(nextTrack);
        }, 100);
        return;
      }
    }

    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextTrack = tracks[currentIndex + 1] || tracks[0];
    setCurrentTrack(nextTrack);
  };

  const handlePrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevTrack = tracks[currentIndex - 1] || tracks[tracks.length - 1];
    setCurrentTrack(prevTrack);
  };

  const handleAdEnded = () => {
    setIsPlayingAd(false);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  if (!currentTrack) return null;

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />
      <audio
        ref={adAudioRef}
        onEnded={handleAdEnded}
      />
      
      <div className="w-full px-3 md:px-4 py-3 md:py-4">
        <div className="flex flex-col gap-2 md:gap-3 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              {currentTrack.cover ? (
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name="Music" size={20} className="text-muted-foreground md:w-6 md:h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm md:text-base line-clamp-1">
                  {isPlayingAd ? '🔊 Рекламная пауза' : currentTrack.title}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                  {isPlayingAd ? 'Слушайте рекламу' : currentTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handlePrevious} 
                className="w-8 h-8 md:w-10 md:h-10"
                disabled={isPlayingAd}
              >
                <Icon name="SkipBack" size={16} className="md:w-5 md:h-5" />
              </Button>
              <Button 
                size="icon" 
                className="w-10 h-10 md:w-12 md:h-12" 
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isPlayingAd}
              >
                <Icon name={isPlaying ? "Pause" : "Play"} size={20} className="md:w-6 md:h-6" fill="currentColor" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleNext} 
                className="w-8 h-8 md:w-10 md:h-10"
                disabled={isPlayingAd}
              >
                <Icon name="SkipForward" size={16} className="md:w-5 md:h-5" />
              </Button>
            </div>

            <div className="hidden lg:flex items-center gap-2 w-24 xl:w-32 flex-shrink-0">
              <Icon name="Volume2" size={16} className="text-muted-foreground md:w-[18px] md:h-[18px]" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative h-16 md:h-20 w-full rounded-lg overflow-hidden bg-gradient-to-b from-primary/5 to-background border border-primary/10">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={80}
                className="w-full h-full"
              />
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs text-muted-foreground w-10 md:w-12 text-right flex-shrink-0">{currentTime}</span>
              <Slider
                value={[progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10 md:w-12 flex-shrink-0">{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};