import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';
import { CopyrightWarningDialog } from './CopyrightWarningDialog';
import { AgeWarningDialog } from './AgeWarningDialog';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  audioUrl: string;
  genre: string;
  year: number;
  price?: number;
  purchasedBy?: string[];
  isAdultContent?: boolean;
}

interface TrackCardProps {
  track: Track;
  index: number;
  onEdit?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const TrackCard = ({ track, index, onEdit, selectionMode = false, isSelected = false, onToggleSelect }: TrackCardProps) => {
  const { isAdmin, user } = useAuth();
  const { deleteTrack, currentTrack, setCurrentTrack, isPlaying, setIsPlaying } = useMusic();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [purchasedTracks, setPurchasedTracks] = useState<number[]>(() => {
    const saved = localStorage.getItem('purchased_tracks');
    return saved ? JSON.parse(saved) : [];
  });
  const [confirmedAdultTracks, setConfirmedAdultTracks] = useState<number[]>(() => {
    const saved = localStorage.getItem('confirmed_adult_tracks');
    return saved ? JSON.parse(saved) : [];
  });

  const handlePlayPause = () => {
    if (track.isAdultContent && !confirmedAdultTracks.includes(track.id) && !isAdmin) {
      setShowAgeWarning(true);
      return;
    }

    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Войдите в систему для покупки трека',
        variant: 'destructive'
      });
      return;
    }
    setShowWarning(true);
  };

  const completePurchase = () => {
    const updatedPurchases = [...purchasedTracks, track.id];
    setPurchasedTracks(updatedPurchases);
    localStorage.setItem('purchased_tracks', JSON.stringify(updatedPurchases));
    
    toast({
      title: 'Успешно!',
      description: `Трек "${track.title}" куплен. Помните об авторских правах!`
    });
  };

  const confirmAdultContent = () => {
    const updatedConfirmed = [...confirmedAdultTracks, track.id];
    setConfirmedAdultTracks(updatedConfirmed);
    localStorage.setItem('confirmed_adult_tracks', JSON.stringify(updatedConfirmed));
    
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const isPurchased = purchasedTracks.includes(track.id);
  const isFree = !track.price || track.price === 0;
  const canPlay = true;

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <>
      <CopyrightWarningDialog 
        open={showWarning}
        onOpenChange={setShowWarning}
        onAccept={completePurchase}
        trackTitle={track.title}
      />
      <AgeWarningDialog 
        open={showAgeWarning}
        onOpenChange={setShowAgeWarning}
        onAccept={confirmAdultContent}
        trackTitle={track.title}
      />
      <Card
        className={`group overflow-hidden hover-lift elegant-shadow transition-all duration-300 animate-fade-in relative ${
          track.isAdultContent && !confirmedAdultTracks.includes(track.id) && !isAdmin ? 'blur-sm' : ''
        } ${
          selectionMode && isSelected ? 'ring-2 ring-primary' : ''
        }`}
        style={{ animationDelay: `${index * 30}ms` }}
        onClick={selectionMode ? onToggleSelect : undefined}
      >
        {track.isAdultContent && !confirmedAdultTracks.includes(track.id) && !isAdmin && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-xl md:text-2xl shadow-lg pointer-events-auto blur-none">
              18+
            </div>
          </div>
        )}
      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
        {selectionMode && (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          />
        )}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary via-primary/80 to-primary/60 p-0.5">
            <div className="w-full h-full rounded-full bg-background p-0.5">
              {track.cover ? (
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full rounded-full bg-muted flex items-center justify-center ${track.cover ? 'hidden' : ''}`}>
                <Icon name="Music" size={24} className="text-muted-foreground md:w-8 md:h-8" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity rounded-full flex items-center justify-center">
            {canPlay ? (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full pulse-glow"
                onClick={handlePlayPause}
              >
                <Icon 
                  name={isCurrentTrack && isPlaying ? "Pause" : "Play"} 
                  size={16}
                  className="md:w-5 md:h-5"
                  fill="currentColor"
                />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                onClick={handlePurchase}
              >
                <Icon 
                  name="Lock" 
                  size={16}
                  className="md:w-5 md:h-5"
                />
              </Button>
            )}
          </div>
          {isCurrentTrack && isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Icon name="Volume2" size={10} className="text-primary-foreground md:w-3 md:h-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg line-clamp-1 mb-0.5 md:mb-1 flex items-center gap-2">
            {track.title}
            {track.isAdultContent && (
              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded font-normal flex-shrink-0">
                18+
              </span>
            )}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 line-clamp-1">{track.artist}</p>
          <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground flex-wrap">
            {track.genre && (
              <span className="flex items-center gap-1">
                <Icon name="Music" size={10} className="md:w-3 md:h-3" />
                <span className="line-clamp-1">{track.genre}</span>
              </span>
            )}
            {track.year && (
              <span className="hidden sm:flex items-center gap-1">
                <Icon name="Calendar" size={10} className="md:w-3 md:h-3" />
                {track.year}
              </span>
            )}
            {track.duration && (
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={10} className="md:w-3 md:h-3" />
                {track.duration}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isFree && !isPurchased && !isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{track.price} ₽</span>
              <Button
                size="sm"
                variant="default"
                className="h-8 md:h-10"
                onClick={handlePurchase}
              >
                <Icon name="ShoppingCart" size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
                Купить
              </Button>
            </div>
          )}
          {isPurchased && !isAdmin && (
            <span className="text-xs md:text-sm text-green-600 font-medium flex items-center gap-1">
              <Icon name="Check" size={14} className="md:w-4 md:h-4" />
              Куплено
            </span>
          )}
          {isAdmin && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-primary hover:text-primary w-8 h-8 md:w-10 md:h-10"
                  onClick={onEdit}
                >
                  <Icon name="Edit" size={16} className="md:w-[18px] md:h-[18px]" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive w-8 h-8 md:w-10 md:h-10"
                onClick={() => deleteTrack(track.id)}
              >
                <Icon name="Trash2" size={16} className="md:w-[18px] md:h-[18px]" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
    </>
  );
};