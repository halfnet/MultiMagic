// GameContent.tsx
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Timer } from '@/components/amc/Timer';
import { SubmitButton } from './SubmitButton';
import { ExitButton } from './ExitButton';
import { Problem } from './types';
import {TutorChat} from './TutorChat'; // Assuming TutorChat.tsx exists in the same directory


async function endTutorSession(userId: number, problemId: number) {
  try {
    const response = await fetch('/api/csrf-token');
    const { csrfToken } = await response.json();
    
    await fetch('/api/tutor-chat/end-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ userId, problemId }),
    });
  } catch (error) {
    console.error('Error ending tutor session:', error);
  }
}

interface GameContentProps {
  currentProblem: Problem;
  currentIndex: number;
  totalProblems: number;
  gameStatus: 'inProgress' | 'complete';
  startTime: number;
  answeredCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onAnswer: (value: string) => void;
  userAnswers: { [key: number]: string };
  onSubmit: () => void;
  onExit: () => void;
  onShowResults: () => void;
  selectedProblems: Problem[];
  tutorMode: boolean;
  userId: number; // Added userId prop
}

export function GameContent({
  currentProblem,
  currentIndex,
  totalProblems,
  gameStatus,
  startTime,
  answeredCount,
  onPrevious,
  onNext,
  onAnswer,
  userAnswers,
  onSubmit,
  onExit,
  onShowResults,
  selectedProblems,
  tutorMode,
  userId, // Added userId prop
}: GameContentProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex justify-between items-center w-full mb-1">
            <div className="text-sm text-grey-500">
              <div>
                Year {currentProblem?.year} - Problem {currentProblem?.problem_number}
              </div>
              {!tutorMode && (
                <div className="mt-1">
                  Problem {currentIndex + 1} of {totalProblems}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <div className="text-sm text-grey-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  {gameStatus === 'inProgress' && <Timer startTime={startTime} />}
                </div>
                {!tutorMode && (
                  <div className="text-sm text-grey-500">
                    Answered: {answeredCount}
                  </div>
                )}
              </div>
              {gameStatus === 'inProgress' && (
                <SubmitButton
                  onSubmit={() => {
                    if (tutorMode) {
                      endTutorSession(userId, currentProblem.id);
                    }
                    onSubmit();
                  }}
                  answeredCount={answeredCount}
                  totalProblems={selectedProblems.length}
                  selectedProblems={selectedProblems}
                />
              )}
              <ExitButton 
                gameStatus={gameStatus} 
                onExit={() => {
                  if (tutorMode) {
                    endTutorSession(userId, currentProblem.id);
                  }
                  onExit();
                }} 
              />
            </div>
          </div>
        <div className="space-y-2">
          <div
            className="[&_img]:inline-block [&_img]:align-middle [&_img]:mx-1"
            dangerouslySetInnerHTML={{ __html: currentProblem?.question_html || '' }}
          />
          <div className="mt-4 mx-auto">
            <div className="flex w-1/2 justify-between items-center">
              {['A', 'B', 'C', 'D', 'E'].map(option => (
                <div key={option} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${option}`}
                    name="answer"
                    value={option}
                    checked={userAnswers[currentIndex] === option}
                    onChange={e => onAnswer(e.target.value)}
                    disabled={gameStatus === 'complete'}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label
                    htmlFor={`option-${option}`}
                    className="ml-2 text-lg font-medium text-gray-700 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {!tutorMode && (
            <div className="flex gap-2">
              <Button
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className="bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                Previous
              </Button>
              <Button
                onClick={onNext}
                disabled={currentIndex === totalProblems - 1}
                className="bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                Next
              </Button>
            </div>
          )}
          <div className="flex gap-2 justify-between">
            <div className="flex items-center gap-4">
              {gameStatus === 'complete' && (
                <Button
                  onClick={onShowResults}
                  className="bg-primary/90 hover:bg-primary text-primary-foreground"
                >
                  Go to Results
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {tutorMode && (
        <div className="w-full mt-6">
          <TutorChat
            problemId={currentProblem.id}
            currentQuestion={currentProblem.question_html}
            currentAsnwer={currentProblem.answer}
            currentSolution={currentProblem.solution_html}
            userId={userId} // Passed userId prop
          />
        </div>
      )}
    </div>
  );
}