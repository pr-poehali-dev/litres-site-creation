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
        className={`group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-2 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 ${
          isCurrentTrack && isPlaying 
            ? 'border-primary/60 shadow-xl shadow-primary/30 scale-[1.01]' 
            : 'border-border/40 hover:border-primary/40'
        } ${
          track.isAdultContent && !confirmedAdultTracks.includes(track.id) && !isAdmin ? 'blur-sm' : ''
        } ${
          selectionMode && isSelected ? 'ring-4 ring-primary ring-offset-2' : ''
        }`}
        style={{ animationDelay: `${index * 40}ms` }}
        onClick={selectionMode ? onToggleSelect : undefined}
      >
        {isCurrentTrack && isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-pulse pointer-events-none" />
        )}

        {track.isAdultContent && !confirmedAdultTracks.includes(track.id) && !isAdmin && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-bold text-2xl shadow-2xl pointer-events-auto blur-none border-2 border-destructive-foreground/20">
              18+
            </div>
          </div>
        )}

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            {selectionMode && (
              <Checkbox 
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 flex-shrink-0"
              />
            )}

            <div className="relative group/cover flex-shrink-0">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                {isCurrentTrack && isPlaying && (
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-primary/40 rounded-2xl animate-[ping_2s_ease-in-out_infinite]" />
                  </div>
                )}
                
                {track.cover ? (
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`relative z-10 w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center ${track.cover ? 'hidden' : ''}`}>
                  <Icon name="Music" size={40} className="text-primary/60" />
                </div>

                <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                  {canPlay ? (
                    <Button
                      size="icon"
                      className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transform transition-transform hover:scale-110"
                      onClick={handlePlayPause}
                    >
                      <Icon 
                        name={isCurrentTrack && isPlaying ? "Pause" : "Play"} 
                        size={24}
                        fill="currentColor"
                      />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      className="w-14 h-14 rounded-full shadow-2xl"
                      onClick={handlePurchase}
                    >
                      <Icon name="Lock" size={24} />
                    </Button>
                  )}
                </div>

                {isCurrentTrack && isPlaying && (
                  <div className="absolute -bottom-2 -right-2 z-30 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-bounce">
                    <Icon name="Volume2" size={14} className="text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1 flex items-center gap-2">
                    {track.title}
                    {track.isAdultContent && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-md font-semibold flex-shrink-0 shadow-sm">
                        18+
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 font-medium">{track.artist}</p>
                </div>

                {isAdmin && !selectionMode && (
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                      }}
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Удалить трек?')) {
                          deleteTrack(track.id);
                        }
                      }}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
                  <Icon name="Music2" size={12} className="text-primary" />
                  <span className="font-medium">{track.genre}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
                  <Icon name="Calendar" size={12} className="text-secondary" />
                  <span className="font-medium">{track.year}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
                  <Icon name="Clock" size={12} className="text-accent" />
                  <span className="font-medium">{track.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {!isFree ? (
                  <div className="flex items-center gap-2">
                    {isPurchased ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        <Icon name="CheckCircle" size={14} />
                        <span className="text-xs font-semibold">Куплено</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handlePurchase}
                        className="rounded-lg px-4 shadow-md hover:shadow-lg transition-all"
                      >
                        <Icon name="ShoppingCart" size={14} className="mr-1.5" />
                        <span className="font-semibold">{track.price} ₽</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Icon name="Music" size={14} />
                    <span className="text-xs font-semibold">Бесплатно</span>
                  </div>
                )}

                {!selectionMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Icon 
                      name={isCurrentTrack && isPlaying ? "Pause" : "Play"} 
                      size={16}
                      fill="currentColor"
                    />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
