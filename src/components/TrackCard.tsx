import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  audioUrl: string;
  genre: string;
  year: number;
}

interface TrackCardProps {
  track: Track;
  index: number;
}

export const TrackCard = ({ track, index }: TrackCardProps) => {
  const { isAdmin } = useAuth();
  const { deleteTrack, currentTrack, setCurrentTrack, isPlaying, setIsPlaying } = useMusic();

  const handlePlayPause = () => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <Card
      className="group overflow-hidden hover-lift elegant-shadow transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
          {track.cover ? (
            <img
              src={track.cover}
              alt={track.title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full rounded-lg bg-muted flex items-center justify-center ${track.cover ? 'hidden' : ''}`}>
            <Icon name="Music" size={24} className="text-muted-foreground md:w-8 md:h-8" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
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
          </div>
          {isCurrentTrack && isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Icon name="Volume2" size={10} className="text-primary-foreground md:w-3 md:h-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg line-clamp-1 mb-0.5 md:mb-1">{track.title}</h3>
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
          {isAdmin && (
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive w-8 h-8 md:w-10 md:h-10"
              onClick={() => deleteTrack(track.id)}
            >
              <Icon name="Trash2" size={16} className="md:w-[18px] md:h-[18px]" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};