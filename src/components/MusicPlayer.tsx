import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useMusic } from '@/contexts/MusicContext';
import { AudioVisualizer } from './MusicPlayer/AudioVisualizer';
import { PlayerControls } from './MusicPlayer/PlayerControls';
import { TrackInfo } from './MusicPlayer/TrackInfo';

export const MusicPlayer = () => {
  const { currentTrack, isPlaying, setIsPlaying, tracks, setCurrentTrack } = useMusic();
  const audioRef = useRef<HTMLAudioElement>(null);
  const adAudioRef = useRef<HTMLAudioElement>(null);
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
            <TrackInfo currentTrack={currentTrack} isPlayingAd={isPlayingAd} />

            <PlayerControls
              isPlaying={isPlaying}
              isPlayingAd={isPlayingAd}
              volume={volume}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
            
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
