import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface PlayerControlsProps {
  isPlaying: boolean;
  isPlayingAd: boolean;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (value: number[]) => void;
}

export const PlayerControls = ({
  isPlaying,
  isPlayingAd,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
}: PlayerControlsProps) => {
  return (
    <>
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onPrevious} 
          className="w-8 h-8 md:w-10 md:h-10"
          disabled={isPlayingAd}
        >
          <Icon name="SkipBack" size={16} className="md:w-5 md:h-5" />
        </Button>
        <Button 
          size="icon" 
          className="w-10 h-10 md:w-12 md:h-12" 
          onClick={onPlayPause}
          disabled={isPlayingAd}
        >
          <Icon name={isPlaying ? "Pause" : "Play"} size={20} className="md:w-6 md:h-6" fill="currentColor" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onNext} 
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
          onValueChange={onVolumeChange}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>
    </>
  );
};
