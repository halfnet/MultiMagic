// GamePlay.tsx
import { Problem } from './types';
import { GameContent } from './GameContent';

interface GamePlayProps {
  currentProblem: Problem;
  currentIndex: number;
  totalProblems: number;
  gameStatus: 'inProgress' | 'complete';
  startTime: number;
  answeredCount: number;
  userAnswers: { [key: number]: string };
  tutorMode: boolean;
  selectedProblems: Problem[];
  onPrevious: () => void;
  onNext: () => void;
  onAnswer: (value: string) => void;
  onSubmit: () => void;
  onExit: () => void;
  onShowResults: () => void;
  userId: number;
}

export function GamePlay(props: GamePlayProps) {
  return (
    <GameContent
      currentProblem={props.currentProblem}
      currentIndex={props.currentIndex}
      totalProblems={props.totalProblems}
      gameStatus={props.gameStatus}
      startTime={props.startTime}
      answeredCount={props.answeredCount}
      onPrevious={props.onPrevious}
      onNext={props.onNext}
      onAnswer={props.onAnswer}
      userAnswers={props.userAnswers}
      onSubmit={props.onSubmit}
      onExit={props.onExit}
      onShowResults={props.onShowResults}
      selectedProblems={props.selectedProblems}
      tutorMode={props.tutorMode}
    />
  );
}