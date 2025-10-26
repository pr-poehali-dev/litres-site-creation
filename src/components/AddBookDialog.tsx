import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooks } from '@/contexts/BookContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddBookDialog = ({ open, onOpenChange }: AddBookDialogProps) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [cover, setCover] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { addBook } = useBooks();
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
    setPrice('');
    setRating('');
    setCover('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      addBook({
        title,
        author,
        genre,
        price: parseFloat(price),
        rating: parseFloat(rating),
        cover: cover || '/placeholder.svg',
        description,
      });

      toast({
        title: 'Книга добавлена!',
        description: `${title} успешно добавлена в каталог`,
      });

      resetForm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Добавить новую книгу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                placeholder="Введите название книги"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Автор *</Label>
              <Input
                id="author"
                placeholder="Введите автора"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Жанр *</Label>
              <Select value={genre} onValueChange={setGenre} required>
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Выберите жанр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Классика">Классика</SelectItem>
                  <SelectItem value="Фантастика">Фантастика</SelectItem>
                  <SelectItem value="Детектив">Детектив</SelectItem>
                  <SelectItem value="Романтика">Романтика</SelectItem>
                  <SelectItem value="Бизнес">Бизнес</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                placeholder="299"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Рейтинг (1-5) *</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              placeholder="4.5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">URL обложки</Label>
            <Input
              id="cover"
              type="url"
              placeholder="https://example.com/cover.jpg"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Оставьте пустым для использования заглушки
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              placeholder="Краткое описание книги..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                  Добавление...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить книгу
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
