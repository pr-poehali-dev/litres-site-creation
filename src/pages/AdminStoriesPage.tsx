import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import funcUrls from '../../func2url.json';

interface Story {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
  isActive: boolean;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    imageUrl: '',
    durationHours: 24
  });

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

  const createStory = async () => {
    if (!newStory.title || !newStory.imageUrl) {
      alert('Заполните все поля');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch(`${funcUrls.books}?action=stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1'
        },
        body: JSON.stringify(newStory)
      });

      if (response.ok) {
        setNewStory({ title: '', imageUrl: '', durationHours: 24 });
        await fetchStories();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка создания Story');
      }
    } catch (error) {
      console.error('Ошибка создания Story:', error);
      alert('Ошибка создания Story');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteStory = async (id: number) => {
    if (!confirm('Удалить эту историю?')) return;

    try {
      const response = await fetch(`${funcUrls.books}?action=stories&id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': '1'
        }
      });

      if (response.ok) {
        await fetchStories();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка удаления Story');
      }
    } catch (error) {
      console.error('Ошибка удаления Story:', error);
      alert('Ошибка удаления Story');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление Stories</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Создать новую историю</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={newStory.title}
                onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                placeholder="Новинки недели"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL изображения</Label>
              <Input
                id="imageUrl"
                value={newStory.imageUrl}
                onChange={(e) => setNewStory({ ...newStory, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="duration">Длительность (часов)</Label>
              <Input
                id="duration"
                type="number"
                value={newStory.durationHours}
                onChange={(e) => setNewStory({ ...newStory, durationHours: parseInt(e.target.value) || 24 })}
                min={1}
                max={168}
              />
            </div>

            <Button
              onClick={createStory}
              disabled={isCreating}
              className="w-full"
            >
              <Plus className="mr-2" size={20} />
              {isCreating ? 'Создание...' : 'Создать Story'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Активные истории</h2>

          {loading ? (
            <p className="text-gray-500">Загрузка...</p>
          ) : stories.length === 0 ? (
            <p className="text-gray-500">Нет активных историй</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div key={story.id} className="border rounded-lg overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Создано: {formatDate(story.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Истекает: {formatDate(story.expiresAt)}</span>
                      </div>
                      <p>Просмотры: {story.viewsCount}</p>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteStory(story.id)}
                      className="w-full"
                    >
                      <Trash2 className="mr-2" size={16} />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}