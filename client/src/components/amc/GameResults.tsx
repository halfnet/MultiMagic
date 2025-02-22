// GameResults.tsx
import { Button } from '@/components/ui/button';
import { formatTime } from '@/components/amc/utils';
import { Problem } from './types';
import { AchievementsDisplay } from './AchievementsDisplay';
import { ProblemResults } from './ProblemResults';

interface GameResultsProps {
  score: number;
  elapsedTime: number;
  problems: Problem[];
  userAnswers: { [key: number]: string };
  onReview: (index: number) => void;
  onExit: () => void;
  onPlayAgain: () => void;
}

export function GameResults({
  score,
  elapsedTime,
  problems,
  userAnswers,
  onReview,
  onExit,
  onPlayAgain,
}: GameResultsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Game Complete!</h2>
      <p className="text-xl text-center">
        Your score: {score} out of {problems.length}
      </p>
      <p className="text-xl text-center">Time Taken: {formatTime(elapsedTime)}</p>
      {score === 5 && <AchievementsDisplay elapsedTime={elapsedTime} />}
      <ProblemResults problems={problems} userAnswers={userAnswers} onReview={onReview} />
      <div className="flex justify-center gap-4">
        <Button onClick={onExit}>Exit Game</Button>
        <Button onClick={onPlayAgain}>Play Again</Button>
      </div>
    </div>
  );
}