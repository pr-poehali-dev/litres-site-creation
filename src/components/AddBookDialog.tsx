import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBooks, BookFormat, Book } from '@/contexts/BookContext';
import { useToast } from '@/hooks/use-toast';
import { BookBasicFields } from './book-form/BookBasicFields';
import { BookFormatsSection } from './book-form/BookFormatsSection';
import { BookBadgesSection } from './book-form/BookBadgesSection';
import { EbookSection } from './book-form/EbookSection';
import { AdultContentSection } from './book-form/AdultContentSection';
import { BonusSection } from './book-form/BonusSection';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookToEdit?: Book | null;
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

export const AddBookDialog = ({ open, onOpenChange, bookToEdit }: AddBookDialogProps) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [rating, setRating] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [bookFiles, setBookFiles] = useState<Map<string, File>>(new Map());
  const [loading, setLoading] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [hasEbook, setHasEbook] = useState(false);
  const [ebookText, setEbookText] = useState('');
  const [ebookPrice, setEbookPrice] = useState('');
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');
  const [canPayWithBonus, setCanPayWithBonus] = useState(false);

  const { addBook, updateBook } = useBooks();
  const { toast } = useToast();

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setGenre(bookToEdit.genre);
      setPrice(bookToEdit.price.toString());
      setDiscountPrice(bookToEdit.discountPrice?.toString() || '');
      setRating(bookToEdit.rating.toString());
      setCoverPreview(bookToEdit.cover);
      setDescription(bookToEdit.description);
      setSelectedFormats(new Set(bookToEdit.formats.map(f => f.format)));
      setSelectedBadges(bookToEdit.badges || []);
      setHasEbook(!!bookToEdit.ebookText);
      setEbookText(bookToEdit.ebookText || '');
      setEbookPrice(bookToEdit.ebookPrice?.toString() || '');
      setIsAdultContent(bookToEdit.isAdultContent || false);
      setBonusAmount(bookToEdit.bonusAmount?.toString() || '');
      setCanPayWithBonus(bookToEdit.canPayWithBonus || false);
    } else {
      resetForm();
    }
  }, [bookToEdit, open]);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
    setPrice('');
    setDiscountPrice('');
    setRating('');
    setCoverFile(null);
    setCoverPreview('');
    setDescription('');
    setSelectedFormats(new Set());
    setBookFiles(new Map());
    setSelectedBadges([]);
    setHasEbook(false);
    setEbookText('');
    setEbookPrice('');
    setIsAdultContent(false);
    setBonusAmount('');
    setCanPayWithBonus(false);
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
      if (selectedFormats.size === 0 && !hasEbook) {
        toast({
          title: 'Ошибка',
          description: 'Выберите хотя бы один формат книги или добавьте электронную книгу',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (hasEbook && !ebookText.trim()) {
        toast({
          title: 'Ошибка',
          description: 'Введите текст электронной книги',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (hasEbook && !ebookPrice) {
        toast({
          title: 'Ошибка',
          description: 'Укажите цену электронной книги',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      for (const format of selectedFormats) {
        const hasExistingFile = bookToEdit?.formats.some(f => f.format === format);
        if (!bookFiles.has(format) && !hasExistingFile) {
          toast({
            title: 'Ошибка',
            description: `Загрузите файл для формата ${format.toUpperCase()}`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        const file = bookFiles.get(format);
        if (file && file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Файл слишком большой',
            description: `Файл ${format.toUpperCase()} весит ${(file.size / 1024 / 1024).toFixed(1)} МБ. Максимум 5 МБ.`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      let coverUrl = bookToEdit?.cover || '/placeholder.svg';
      if (coverFile) {
        const reader = new FileReader();
        coverUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(coverFile);
        });
      }

      const formats: BookFormat[] = bookToEdit?.formats || [];
      for (const [format, file] of bookFiles) {
        const reader = new FileReader();
        const fileUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const existingIndex = formats.findIndex(f => f.format === format);
        if (existingIndex >= 0) {
          formats[existingIndex] = { format, fileUrl };
        } else {
          formats.push({ format, fileUrl });
        }
      }

      const bookData = {
        title,
        author,
        genre,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
        rating: parseFloat(rating),
        cover: coverUrl,
        description,
        formats,
        badges: selectedBadges,
        ebookText: hasEbook ? ebookText : undefined,
        ebookPrice: hasEbook ? parseFloat(ebookPrice) : undefined,
        isAdultContent,
        bonusAmount: bonusAmount ? parseFloat(bonusAmount) : undefined,
        canPayWithBonus,
      };

      if (bookToEdit) {
        await updateBook(bookToEdit.id, bookData);
        toast({
          title: 'Книга обновлена!',
          description: `${title} успешно обновлена`,
        });
      } else {
        console.log('Добавление книги:', bookData);
        await addBook(bookData);
        console.log('Книга успешно добавлена');
        toast({
          title: 'Книга добавлена!',
          description: `${title} успешно добавлена в каталог`,
        });
      }

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
          <DialogTitle className="text-2xl font-bold">
            {bookToEdit ? 'Редактировать книгу' : 'Добавить новую книгу'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BookBasicFields
            title={title}
            setTitle={setTitle}
            author={author}
            setAuthor={setAuthor}
            genre={genre}
            setGenre={setGenre}
            price={price}
            setPrice={setPrice}
            discountPrice={discountPrice}
            setDiscountPrice={setDiscountPrice}
            rating={rating}
            setRating={setRating}
            description={description}
            setDescription={setDescription}
            coverPreview={coverPreview}
            handleCoverChange={handleCoverChange}
          />

          <BookFormatsSection
            availableFormats={availableFormats}
            selectedFormats={selectedFormats}
            handleFormatToggle={handleFormatToggle}
            handleBookFileChange={handleBookFileChange}
            bookFiles={bookFiles}
            bookToEdit={bookToEdit}
          />

          <BookBadgesSection
            selectedBadges={selectedBadges}
            setSelectedBadges={setSelectedBadges}
          />

          <EbookSection
            hasEbook={hasEbook}
            setHasEbook={setHasEbook}
            ebookText={ebookText}
            setEbookText={setEbookText}
            ebookPrice={ebookPrice}
            setEbookPrice={setEbookPrice}
          />

          <AdultContentSection
            isAdultContent={isAdultContent}
            setIsAdultContent={setIsAdultContent}
          />

          <BonusSection
            bonusAmount={bonusAmount}
            setBonusAmount={setBonusAmount}
            canPayWithBonus={canPayWithBonus}
            setCanPayWithBonus={setCanPayWithBonus}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : bookToEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};