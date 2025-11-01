import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface BonusSectionProps {
  bonusAmount: string;
  setBonusAmount: (value: string) => void;
  canPayWithBonus: boolean;
  setCanPayWithBonus: (value: boolean) => void;
}

export const BonusSection = ({
  bonusAmount,
  setBonusAmount,
  canPayWithBonus,
  setCanPayWithBonus,
}: BonusSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon name="Gift" size={20} className="text-primary" />
          <div>
            <CardTitle>Бонусная программа</CardTitle>
            <CardDescription>
              Настройте начисление и оплату бонусами
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bonusAmount">
            Бонус за покупку (₽)
          </Label>
          <Input
            id="bonusAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Например: 50"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Сколько бонусов начислится покупателю после покупки этой книги
          </p>
        </div>

        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
          <Checkbox
            id="canPayWithBonus"
            checked={canPayWithBonus}
            onCheckedChange={(checked) => setCanPayWithBonus(checked as boolean)}
          />
          <div className="flex-1">
            <Label
              htmlFor="canPayWithBonus"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Можно оплатить бонусами
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Разрешить покупателям оплачивать эту книгу бонусными баллами
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
