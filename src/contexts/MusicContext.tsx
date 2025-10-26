import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface MusicContextType {
  tracks: Track[];
  addTrack: (track: Omit<Track, 'id'>) => void;
  deleteTrack: (trackId: number) => void;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem('music_tracks');
      if (savedTracks) {
        const parsed = JSON.parse(savedTracks);
        setTracks(parsed);
        console.log('Loaded tracks from localStorage:', parsed.length);
      }
    } catch (error) {
      console.error('Failed to load tracks from localStorage:', error);
      localStorage.removeItem('music_tracks');
    }
  }, []);

  const addTrack = (track: Omit<Track, 'id'>) => {
    const newTrack = {
      ...track,
      id: Date.now()
    };
    const updatedTracks = [...tracks, newTrack];
    setTracks(updatedTracks);
    
    try {
      const serialized = JSON.stringify(updatedTracks);
      localStorage.setItem('music_tracks', serialized);
      console.log('Track saved successfully. Total tracks:', updatedTracks.length);
    } catch (error) {
      console.error('Failed to save track to localStorage:', error);
      alert('Ошибка: Файл слишком большой для сохранения. Попробуйте меньший файл.');
      setTracks(tracks);
    }
  };

  const deleteTrack = (trackId: number) => {
    const updatedTracks = tracks.filter(t => t.id !== trackId);
    setTracks(updatedTracks);
    localStorage.setItem('music_tracks', JSON.stringify(updatedTracks));
    
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  return (
    <MusicContext.Provider value={{ 
      tracks, 
      addTrack, 
      deleteTrack,
      currentTrack,
      setCurrentTrack,
      isPlaying,
      setIsPlaying
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};