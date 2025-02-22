// SubmitButton.tsx
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
import { Problem } from './types';

interface SubmitButtonProps {
  onSubmit: () => void;
  answeredCount: number;
  totalProblems: number;
  selectedProblems: Problem[];
}

export function SubmitButton({
  onSubmit,
  answeredCount,
  totalProblems,
  selectedProblems,
}: SubmitButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">Submit Answers</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Answers?</AlertDialogTitle>
          <AlertDialogDescription>
            {answeredCount < selectedProblems.length
              ? `You have answered ${answeredCount} out of ${selectedProblems.length} questions. Are you sure you want to submit?`
              : 'Are you ready to submit your answers?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} className="bg-primary hover:bg-primary/90">
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}