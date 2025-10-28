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
  price?: number;
  purchasedBy?: string[];
  isAdultContent?: boolean;
}

interface MusicContextType {
  tracks: Track[];
  addTrack: (track: Omit<Track, 'id'>) => Promise<void>;
  deleteTrack: (trackId: number) => Promise<void>;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  loading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const API_URL = 'https://functions.poehali.dev/ec070e88-268a-4a1e-9669-8a24114d395e';

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTracks(data.tracks || []);
      console.log('Loaded tracks from backend:', data.tracks?.length || 0);
    } catch (error) {
      console.error('Failed to load tracks from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTrack = async (track: Omit<Track, 'id'>) => {
    try {
      console.log('Sending track to backend:', track);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(track)
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(`Failed to add track: ${responseData.error || response.statusText}`);
      }
      
      await fetchTracks();
      console.log('Track saved successfully to backend');
    } catch (error) {
      console.error('Failed to save track to backend:', error);
      throw error;
    }
  };

  const deleteTrack = async (trackId: number) => {
    try {
      const response = await fetch(`${API_URL}?id=${trackId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete track');
      }
      
      if (currentTrack?.id === trackId) {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
      
      await fetchTracks();
      console.log('Track deleted successfully from backend');
    } catch (error) {
      console.error('Failed to delete track from backend:', error);
      alert('Ошибка при удалении трека. Попробуйте снова.');
      throw error;
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
      setIsPlaying,
      loading
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