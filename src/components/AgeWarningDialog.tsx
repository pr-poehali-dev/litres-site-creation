import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";

interface AgeWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  trackTitle: string;
}

export const AgeWarningDialog = ({ open, onOpenChange, onAccept, trackTitle }: AgeWarningDialogProps) => {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Icon name="AlertTriangle" size={24} />
            Возрастное ограничение 18+
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left pt-2">
            <p className="font-medium text-foreground">
              Трек "{trackTitle}" предназначен для совершеннолетних слушателей.
            </p>
            
            <div className="space-y-2 text-sm">
              <p>Контент может содержать:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Нецензурную лексику</li>
                <li>Темы для взрослых</li>
                <li>Контент, не предназначенный для детей</li>
              </ul>
            </div>

            <p className="text-sm font-medium text-destructive">
              Подтверждая, вы заявляете, что вам исполнилось 18 лет.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отказаться</AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept} className="bg-destructive hover:bg-destructive/90">
            Мне есть 18 лет
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
