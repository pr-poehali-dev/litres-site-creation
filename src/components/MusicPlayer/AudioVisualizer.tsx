import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type VisualizerStyle = 'bars' | 'wave' | 'circle' | 'spectrum';
type ColorScheme = 'purple' | 'rainbow' | 'blue' | 'fire' | 'ocean';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

export const AudioVisualizer = ({ audioRef, isPlaying }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [visualizerStyle, setVisualizerStyle] = useState<VisualizerStyle>(() => {
    const saved = localStorage.getItem('visualizerStyle');
    return (saved as VisualizerStyle) || 'bars';
  });
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('visualizerColorScheme');
    return (saved as ColorScheme) || 'purple';
  });

  useEffect(() => {
    localStorage.setItem('visualizerStyle', visualizerStyle);
  }, [visualizerStyle]);

  useEffect(() => {
    localStorage.setItem('visualizerColorScheme', colorScheme);
  }, [colorScheme]);

  const getColors = (index: number, total: number) => {
    let hue = 0;
    let sat = 80;
    let light = 65;

    switch (colorScheme) {
      case 'purple':
        hue = (index / total) * 60 + 260;
        break;
      case 'rainbow':
        hue = (index / total) * 360;
        break;
      case 'blue':
        hue = (index / total) * 60 + 180;
        break;
      case 'fire':
        hue = (index / total) * 60;
        sat = 90;
        light = 60;
        break;
      case 'ocean':
        hue = (index / total) * 80 + 160;
        sat = 70;
        light = 60;
        break;
    }

    return { hue, sat, light };
  };

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
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (visualizerStyle === 'bars') {
        const barCount = 24;
        const barWidth = canvas.width / barCount;
        const gap = 2;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
          let barHeight = (dataArrayRef.current[dataIndex] / 255) * canvas.height;
          
          if (!isPlaying) {
            barHeight = Math.random() * 10 + 5;
          }

          const x = i * barWidth;
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          
          const { hue, sat, light } = getColors(i, barCount);
          gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0.9)`);
          gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light - 10}%, 0.6)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + gap / 2, canvas.height - barHeight, barWidth - gap, barHeight);
        }
      } else if (visualizerStyle === 'wave') {
        const { hue, sat, light } = getColors(0.5, 1);
        ctx.lineWidth = 3;
        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.9)`;
        ctx.beginPath();

        const sliceWidth = canvas.width / dataArrayRef.current.length;
        let x = 0;

        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const v = dataArrayRef.current[i] / 255.0;
          const y = (v * canvas.height) / 2 + canvas.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();

        ctx.strokeStyle = `hsla(${hue + 20}, ${sat}%, ${light + 5}%, 0.5)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (visualizerStyle === 'circle') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const angle = (i / dataArrayRef.current.length) * Math.PI * 2;
          let barHeight = (dataArrayRef.current[i] / 255) * radius * 0.6;
          
          if (!isPlaying) {
            barHeight = Math.random() * 5 + 2;
          }

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);

          const { hue, sat, light } = getColors(i, dataArrayRef.current.length);
          ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.8)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (visualizerStyle === 'spectrum') {
        const barCount = 48;
        const barWidth = canvas.width / barCount;
        const gap = 1;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
          let barHeight = (dataArrayRef.current[dataIndex] / 255) * canvas.height * 0.8;
          
          if (!isPlaying) {
            barHeight = Math.random() * 8 + 3;
          }

          const x = i * barWidth;
          const centerY = canvas.height / 2;
          
          const { hue, sat, light } = getColors(i, barCount);
          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0.9)`);
          gradient.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${light - 10}%, 1)`);
          gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0.9)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + gap / 2, centerY - barHeight / 2, barWidth - gap, barHeight);
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, visualizerStyle, colorScheme]);

  return (
    <div className="relative">
      <div className="relative h-16 md:h-20 w-full rounded-lg overflow-hidden bg-gradient-to-b from-primary/5 to-background border border-primary/10">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={80}
          className="w-full h-full"
        />
      </div>
      
      <div className="absolute top-2 right-2 flex gap-2">
        <div className="flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border/50">
          <Button
            size="icon"
            variant={visualizerStyle === 'bars' ? 'default' : 'ghost'}
            className="h-7 w-7"
            onClick={() => setVisualizerStyle('bars')}
            title="Столбцы"
          >
            <Icon name="BarChart3" size={14} />
          </Button>
          <Button
            size="icon"
            variant={visualizerStyle === 'wave' ? 'default' : 'ghost'}
            className="h-7 w-7"
            onClick={() => setVisualizerStyle('wave')}
            title="Волны"
          >
            <Icon name="Waves" size={14} />
          </Button>
          <Button
            size="icon"
            variant={visualizerStyle === 'circle' ? 'default' : 'ghost'}
            className="h-7 w-7"
            onClick={() => setVisualizerStyle('circle')}
            title="Круг"
          >
            <Icon name="CircleDot" size={14} />
          </Button>
          <Button
            size="icon"
            variant={visualizerStyle === 'spectrum' ? 'default' : 'ghost'}
            className="h-7 w-7"
            onClick={() => setVisualizerStyle('spectrum')}
            title="Спектр"
          >
            <Icon name="Activity" size={14} />
          </Button>
        </div>

        <div className="flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border/50">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover:bg-transparent"
            onClick={() => setColorScheme('purple')}
            title="Фиолетовая"
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 ${colorScheme === 'purple' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover:bg-transparent"
            onClick={() => setColorScheme('rainbow')}
            title="Радуга"
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 ${colorScheme === 'rainbow' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover:bg-transparent"
            onClick={() => setColorScheme('blue')}
            title="Синяя"
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 ${colorScheme === 'blue' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover:bg-transparent"
            onClick={() => setColorScheme('fire')}
            title="Огонь"
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 ${colorScheme === 'fire' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover:bg-transparent"
            onClick={() => setColorScheme('ocean')}
            title="Океан"
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 ${colorScheme === 'ocean' ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};
