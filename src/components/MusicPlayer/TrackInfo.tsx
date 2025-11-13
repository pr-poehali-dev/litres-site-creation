import Icon from '@/components/ui/icon';

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

interface TrackInfoProps {
  currentTrack: Track | null;
  isPlayingAd: boolean;
}

export const TrackInfo = ({ currentTrack, isPlayingAd }: TrackInfoProps) => {
  if (!currentTrack) return null;

  return (
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
  );
};
