import { useState } from 'react';
import { Header } from '@/components/Header';
import { AuthDialog } from '@/components/AuthDialog';
import { CartDrawer } from '@/components/CartDrawer';
import { AddBookDialog } from '@/components/AddBookDialog';
import { AddTrackDialog } from '@/components/AddTrackDialog';
import { EditTrackDialog } from '@/components/EditTrackDialog';
import { BulkEditTracksDialog } from '@/components/BulkEditTracksDialog';
import { ExportTracksDialog } from '@/components/ExportTracksDialog';
import { TrackCard } from '@/components/TrackCard';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  audioUrl: string;
  genre?: string;
  year?: number;
  price?: number;
  isAdultContent?: boolean;
}

const Music = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [editTrackOpen, setEditTrackOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const { isAdmin } = useAuth();
  const { tracks, deleteTrack } = useMusic();

  const handleEditTrack = (track: Track) => {
    setSelectedTrack(track);
    setEditTrackOpen(true);
  };

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTrackIds(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTrackIds.length === tracks.length) {
      setSelectedTrackIds([]);
    } else {
      setSelectedTrackIds(tracks.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Удалить ${selectedTrackIds.length} треков?`)) {
      for (const trackId of selectedTrackIds) {
        await deleteTrack(trackId);
      }
      setSelectedTrackIds([]);
      setSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedTrackIds([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header
        onAuthDialogOpen={() => setAuthDialogOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAddBookOpen={() => setAddBookOpen(true)}
      />

      <main className="container mx-auto px-4 py-4 md:py-8 pb-32 md:pb-40">
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Музыка
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Слушайте вашу любимую музыку онлайн
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                {!selectionMode ? (
                  <>
                    <Button onClick={() => setAddTrackOpen(true)} size="default" className="pulse-glow flex-shrink-0">
                      <Icon name="Plus" size={18} className="md:mr-2" />
                      <span className="hidden md:inline">Добавить трек</span>
                    </Button>
                    {tracks.length > 0 && (
                      <>
                        <Button 
                          onClick={() => setSelectionMode(true)} 
                          size="default" 
                          variant="outline"
                          className="flex-shrink-0"
                        >
                          <Icon name="CheckSquare" size={18} className="md:mr-2" />
                          <span className="hidden md:inline">Выбрать</span>
                        </Button>
                        <Button 
                          onClick={() => setExportOpen(true)} 
                          size="default" 
                          variant="outline"
                          className="flex-shrink-0"
                        >
                          <Icon name="Download" size={18} className="md:mr-2" />
                          <span className="hidden md:inline">Экспорт</span>
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <Button 
                    onClick={handleCancelSelection} 
                    size="default" 
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    <Icon name="X" size={18} className="md:mr-2" />
                    <span className="hidden md:inline">Отмена</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative mb-6">
              <Icon name="Music" size={80} className="text-muted-foreground/30" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Icon name="Music" size={80} className="text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Библиотека пуста</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {isAdmin 
                ? "Добавьте первый трек в вашу музыкальную библиотеку"
                : "Здесь пока нет треков. Скоро появятся новые композиции!"
              }
            </p>
            {isAdmin && (
              <Button onClick={() => setAddTrackOpen(true)} size="lg">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить первый трек
              </Button>
            )}
          </div>
        ) : (
          <>
            {selectionMode && isAdmin && (
              <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                  >
                    <Icon name="CheckSquare" size={16} className="mr-2" />
                    {selectedTrackIds.length === tracks.length ? 'Снять всё' : 'Выбрать всё'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Выбрано: {selectedTrackIds.length} из {tracks.length}
                  </span>
                </div>
                {selectedTrackIds.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setExportOpen(true)}
                      variant="outline"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Экспорт
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setBulkEditOpen(true)}
                    >
                      <Icon name="Edit3" size={16} className="mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <TrackCard 
                  key={track.id} 
                  track={track} 
                  index={index}
                  onEdit={isAdmin && !selectionMode ? () => handleEditTrack(track) : undefined}
                  selectionMode={selectionMode}
                  isSelected={selectedTrackIds.includes(track.id)}
                  onToggleSelect={() => toggleTrackSelection(track.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <MusicPlayer />

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
      <AddTrackDialog open={addTrackOpen} onOpenChange={setAddTrackOpen} />
      <EditTrackDialog 
        open={editTrackOpen} 
        onOpenChange={setEditTrackOpen}
        track={selectedTrack}
      />
      <BulkEditTracksDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedTrackIds={selectedTrackIds}
        onComplete={() => {
          setSelectedTrackIds([]);
          setSelectionMode(false);
        }}
      />
      <ExportTracksDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        tracks={tracks}
        selectedTrackIds={selectionMode ? selectedTrackIds : undefined}
      />
      <MobileBottomNav />
    </div>
  );
};

export default Music;