import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface AdultContentSectionProps {
  isAdultContent: boolean;
  setIsAdultContent: (value: boolean) => void;
}

export const AdultContentSection = ({ isAdultContent, setIsAdultContent }: AdultContentSectionProps) => {
  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="isAdultContent"
          checked={isAdultContent}
          onCheckedChange={(checked) => setIsAdultContent(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="isAdultContent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
          >
            <Icon name="AlertTriangle" size={16} className="text-destructive" />
            Контент 18+
          </label>
          <p className="text-sm text-muted-foreground">
            Отметьте, если книга содержит материалы для взрослых. Пользователи увидят предупреждение перед просмотром.
          </p>
        </div>
      </div>
    </div>
  );
};
