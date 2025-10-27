import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CopyrightWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  trackTitle: string;
}

export const CopyrightWarningDialog = ({ 
  open, 
  onOpenChange, 
  onAccept,
  trackTitle 
}: CopyrightWarningDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Icon name="AlertTriangle" size={24} />
            Предупреждение об авторских правах
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">
              Вы собираетесь приобрести трек "{trackTitle}"
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-destructive">
                ⚠️ ВНИМАНИЕ! ВАЖНО!
              </p>
              <p>
                Вы <strong>НЕ ИМЕЕТЕ ПРАВА</strong> нигде этот трек размещать и продавать.
              </p>
              <p>
                Авторские права защищены законом.
              </p>
              <p className="font-semibold">
                В случае размещения где-либо этого трека или его продажи вы можете быть привлечены к уголовной ответственности.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Покупка трека дает вам право только на:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Личное прослушивание</li>
              <li>Скачивание для личного использования</li>
              <li>Использование в личных целях без публикации</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Отменить
          </Button>
          <Button 
            variant="destructive"
            onClick={() => {
              onAccept();
              onOpenChange(false);
            }}
          >
            Понимаю и принимаю условия
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
