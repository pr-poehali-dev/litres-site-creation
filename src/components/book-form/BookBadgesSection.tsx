import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface BookBadgesSectionProps {
  selectedBadges: string[];
  setSelectedBadges: (badges: string[]) => void;
}

const availableBadges = ['Новинка', 'Популярное', 'Бестселлер', 'Скидка'];

export const BookBadgesSection = ({ selectedBadges, setSelectedBadges }: BookBadgesSectionProps) => {
  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Значки</Label>
      <div className="flex flex-wrap gap-2">
        {availableBadges.map((badge) => (
          <Badge
            key={badge}
            variant={selectedBadges.includes(badge) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleBadge(badge)}
          >
            {badge}
          </Badge>
        ))}
      </div>
    </div>
  );
};
