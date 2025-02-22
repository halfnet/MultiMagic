// ExitButton.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ExitButtonProps {
  gameStatus: string;
  onExit: () => void;
}

export function ExitButton({ gameStatus, onExit }: ExitButtonProps) {
  if (gameStatus === 'inProgress') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Exit Game
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onExit} className="bg-primary hover:bg-primary/90">
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant="outline"
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={onExit}
    >
      Exit Game
    </Button>
  );
}