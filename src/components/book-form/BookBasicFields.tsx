import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookBasicFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  author: string;
  setAuthor: (value: string) => void;
  genre: string;
  setGenre: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  discountPrice: string;
  setDiscountPrice: (value: string) => void;
  rating: string;
  setRating: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  coverPreview: string;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BookBasicFields = ({
  title,
  setTitle,
  author,
  setAuthor,
  genre,
  setGenre,
  price,
  setPrice,
  discountPrice,
  setDiscountPrice,
  rating,
  setRating,
  description,
  setDescription,
  coverPreview,
  handleCoverChange,
}: BookBasicFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название *</Label>
          <Input
            id="title"
            placeholder="Название книги"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Автор *</Label>
          <Input
            id="author"
            placeholder="Имя автора"
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
              <SelectItem value="Сказка">Сказка</SelectItem>
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
        <Label htmlFor="discountPrice">Цена со скидкой (₽)</Label>
        <Input
          id="discountPrice"
          type="number"
          min="0"
          step="1"
          placeholder="199"
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Если указана, старая цена будет зачёркнута</p>
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
        <Label htmlFor="cover">Обложка *</Label>
        <Input
          id="cover"
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
        />
        {coverPreview && (
          <div className="mt-2 relative w-32 h-48 rounded-md overflow-hidden border">
            <img src={coverPreview} alt="Preview" className="object-cover w-full h-full" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание *</Label>
        <Textarea
          id="description"
          placeholder="Краткое описание книги"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>
    </>
  );
};
