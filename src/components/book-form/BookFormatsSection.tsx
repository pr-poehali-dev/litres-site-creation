import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface BookFormatsSectionProps {
  availableFormats: Array<{ value: string; label: string }>;
  selectedFormats: Set<string>;
  handleFormatToggle: (format: string) => void;
  handleBookFileChange: (format: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  bookFiles: Map<string, File>;
  bookToEdit?: any;
}

export const BookFormatsSection = ({
  availableFormats,
  selectedFormats,
  handleFormatToggle,
  handleBookFileChange,
  bookFiles,
  bookToEdit,
}: BookFormatsSectionProps) => {
  return (
    <div className="space-y-3">
      <Label>Форматы книги</Label>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {availableFormats.map((format) => {
          const isSelected = selectedFormats.has(format.value);
          const hasExistingFile = bookToEdit?.formats?.some((f: any) => f.format === format.value);
          
          return (
            <div key={format.value} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={format.value}
                  checked={isSelected}
                  onCheckedChange={() => handleFormatToggle(format.value)}
                />
                <label
                  htmlFor={format.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {format.label}
                </label>
              </div>
              
              {isSelected && (
                <div className="ml-6">
                  <Input
                    type="file"
                    accept=".fb2,.txt,.rtf,.pdf,.mobi,.epub,.fb3"
                    onChange={(e) => handleBookFileChange(format.value, e)}
                    className="text-sm"
                  />
                  {bookFiles.has(format.value) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Файл загружен: {bookFiles.get(format.value)?.name}
                    </p>
                  )}
                  {hasExistingFile && !bookFiles.has(format.value) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Файл уже загружен ранее
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
