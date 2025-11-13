import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import funcUrls from '../../func2url.json';

interface Story {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export function MusicStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch(`${funcUrls.books}?action=stories`);
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Ошибка загрузки Stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
            <div className="w-20 h-20 bg-muted rounded-full" />
            <div className="w-16 h-3 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-primary/60 p-0.5 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <div className="w-full h-full rounded-full bg-background p-1">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-foreground/90 max-w-[80px] truncate">
              {story.title}
            </span>
          </button>
        ))}
      </div>

      {selectedStory && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setSelectedStory(null)}
        >
          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={24} className="text-white" />
          </button>
          
          <div className="relative w-full max-w-md h-[90vh] flex flex-col items-center justify-center px-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full animate-progress" />
            </div>

            <div className="flex flex-col items-center gap-6 mt-8">
              <div className="relative w-64 h-64">
                <img
                  src={selectedStory.imageUrl}
                  alt={selectedStory.title}
                  className="w-full h-full rounded-full object-cover shadow-2xl"
                />
              </div>

              <h2 className="text-2xl font-bold text-white text-center px-4">
                {selectedStory.title}
              </h2>

              <Card className="w-full bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border-white/10 p-4 flex items-center gap-4">
                <img
                  src={selectedStory.imageUrl}
                  alt={selectedStory.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{selectedStory.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selectedStory.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Icon name="BarChart2" size={16} className="text-primary" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shadow-lg">
                    <Icon name="Play" size={20} className="text-primary-foreground ml-0.5" />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
