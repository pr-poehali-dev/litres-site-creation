import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface EbookSectionProps {
  hasEbook: boolean;
  setHasEbook: (value: boolean) => void;
  ebookText: string;
  setEbookText: (value: string) => void;
  ebookPrice: string;
  setEbookPrice: (value: string) => void;
}

export const EbookSection = ({
  hasEbook,
  setHasEbook,
  ebookText,
  setEbookText,
  ebookPrice,
  setEbookPrice,
}: EbookSectionProps) => {
  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasEbook"
          checked={hasEbook}
          onCheckedChange={(checked) => setHasEbook(checked as boolean)}
        />
        <label
          htmlFor="hasEbook"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Добавить электронную книгу для чтения онлайн
        </label>
      </div>

      {hasEbook && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ebookText">Текст электронной книги *</Label>
            <Textarea
              id="ebookText"
              placeholder="Введите текст книги..."
              value={ebookText}
              onChange={(e) => setEbookText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ebookPrice">Цена электронной книги (₽) *</Label>
            <Input
              id="ebookPrice"
              type="number"
              min="0"
              step="1"
              placeholder="199"
              value={ebookPrice}
              onChange={(e) => setEbookPrice(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
};
