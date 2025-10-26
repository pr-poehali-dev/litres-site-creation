import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooks, BookFormat } from '@/contexts/BookContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableFormats = [
  { value: 'fb2', label: 'Fb2 - Для смартфонов, планшетов Android, электронных книг' },
  { value: 'txt', label: 'TXT - Можно открыть почти на любом устройстве' },
  { value: 'rtf', label: 'RTF - Можно открыть на любом компьютере' },
  { value: 'pdf-a4', label: 'PDF A4 - Программа Adobe Reader' },
  { value: 'pdf-a6', label: 'PDF A6 - Оптимизирован для смартфонов' },
  { value: 'mobi', label: 'Mobi - Электронные книги Kindle и Android' },
  { value: 'epub', label: 'Epub - iOS (iPhone, iPad, iMac) и большинство приложений' },
  { value: 'ios-epub', label: 'iOS.Epub - Идеально для iPhone и iPad' },
  { value: 'fb3', label: 'Fb3 - Развитие формата FB2' },
];

export const AddBookDialog = ({ open, onOpenChange }: AddBookDialogProps) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [bookFiles, setBookFiles] = useState<Map<string, File>>(new Map());
  const [loading, setLoading] = useState(false);

  const { addBook } = useBooks();
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
    setPrice('');
    setRating('');
    setCoverFile(null);
    setCoverPreview('');
    setDescription('');
    setSelectedFormats(new Set());
    setBookFiles(new Map());
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormatToggle = (format: string) => {
    const newFormats = new Set(selectedFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
      const newFiles = new Map(bookFiles);
      newFiles.delete(format);
      setBookFiles(newFiles);
    } else {
      newFormats.add(format);
    }
    setSelectedFormats(newFormats);
  };

  const handleBookFileChange = (format: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = new Map(bookFiles);
      newFiles.set(format, file);
      setBookFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedFormats.size === 0) {
        toast({
          title: 'Ошибка',
          description: 'Выберите хотя бы один формат книги',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      for (const format of selectedFormats) {
        if (!bookFiles.has(format)) {
          toast({
            title: 'Ошибка',
            description: `Загрузите файл для формата ${format.toUpperCase()}`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      let coverUrl = '/placeholder.svg';
      if (coverFile) {
        const reader = new FileReader();
        coverUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(coverFile);
        });
      }

      const formats: BookFormat[] = [];
      for (const [format, file] of bookFiles) {
        const reader = new FileReader();
        const fileUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        formats.push({ format, fileUrl });
      }

      addBook({
        title,
        author,
        genre,
        price: parseFloat(price),
        rating: parseFloat(rating),
        cover: coverUrl,
        description,
        formats,
      });

      toast({
        title: 'Книга добавлена!',
        description: `${title} успешно добавлена в каталог с ${formats.length} форматами`,
      });

      resetForm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="cover">Обложка книги *</Label>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              required
            />
            {coverPreview && (
              <div className="mt-2">
                <img src={coverPreview} alt="Превью обложки" className="w-32 h-48 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Краткое описание *</Label>
            <Textarea
              id="description"
              placeholder="Краткое описание книги..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Форматы книги *</Label>
            <div className="border rounded-lg p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {availableFormats.map((format) => (
                <div key={format.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={format.value}
                      checked={selectedFormats.has(format.value)}
                      onCheckedChange={() => handleFormatToggle(format.value)}
                    />
                    <label
                      htmlFor={format.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {format.label}
                    </label>
                  </div>
                  {selectedFormats.has(format.value) && (
                    <div className="ml-6">
                      <Input
                        type="file"
                        accept={`.${format.value.split('-')[0]}`}
                        onChange={(e) => handleBookFileChange(format.value, e)}
                        className="text-sm"
                        required
                      />
                      {bookFiles.has(format.value) && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Icon name="CheckCircle" size={12} />
                          {bookFiles.get(format.value)?.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
