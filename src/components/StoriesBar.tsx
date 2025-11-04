import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import funcUrls from '../../func2url.json';

interface Story {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
}

export default function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

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

  const openStory = (story: Story) => {
    setSelectedStory(story);
  };

  const closeStory = () => {
    setSelectedStory(null);
  };

  if (loading || stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => openStory(story)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-700 max-w-[64px] truncate">
              {story.title}
            </span>
          </button>
        ))}
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeStory}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
            <div className="absolute top-2 left-4 right-4 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-progress" />
            </div>

            <img
              src={selectedStory.imageUrl}
              alt={selectedStory.title}
              className="max-w-full max-h-full object-contain"
            />

            <div className="absolute bottom-8 left-4 right-4 text-white">
              <h3 className="text-xl font-bold">{selectedStory.title}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {selectedStory.viewsCount} просмотров
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </>
  );
}