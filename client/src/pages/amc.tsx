import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCookieAuth } from '@/hooks/use-cookie-auth';
import { AchievementBadge } from '@/components/game/AchievementBadge';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { Clock } from 'lucide-react';
import { AmcScreenTime } from '@/components/amc/AmcScreenTime';
import { AmcGamesPlayed } from '@/components/amc/AmcGamesPlayed';
import { Timer } from '@/components/amc/Timer';
import { formatTime } from '@/components/amc/utils';
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

interface Problem {
  id: number;
  year: number;
  competition_type: string;
  problem_number: number;
  question_html: string;
  answer: string;
}

const TOTAL_PROBLEMS = 5;

export default function AMC() {
  const [_, setLocation] = useLocation();
  const { user } = useCookieAuth();
  const { toast } = useToast();
  const [showProblem, setShowProblem] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'inProgress' | 'complete'>('inProgress');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCompetitionType, setCurrentCompetitionType] = useState<string>('AMC 8');
  const [tutorMode, setTutorMode] = useState(false); // Added tutorMode state
  const [gameCompleted, setGameCompleted] = useState(false); // Added gameCompleted state
  useEffect(() => {
    console.info("gameCompleted updated to:", gameCompleted);
  }, [gameCompleted]); // Runs whenever gameCompleted changes
  //console.log("New key:", `${user.id}-${gameCompleted}`);
  
  const startGame = async (competitionType: string = 'AMC 8', isTutor: boolean = false) => {
    try {
      setCurrentCompetitionType(competitionType);
      setGameStatus('inProgress');
      setTutorMode(isTutor); // Set tutorMode based on button click
      setGameCompleted(false); // Reset gameCompleted flag on new game start
      //console.info(gameCompleted)
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      const problems = isTutor ?
        [await fetchSingleProblem(competitionType, csrfToken)] :
        await fetchProblems(competitionType, csrfToken);
      setSelectedProblems(problems);
      setUserAnswers({});
      setCurrentIndex(0);
      setShowProblem(true);
      setShowResults(false);
      setScore(0);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start game. Please try again.',
      });
    }
  };

  const fetchSingleProblem = async (competitionType: string, csrfToken: string): Promise<Problem> => {
    const response = await fetch(
      `/api/amc_problems?userId=${user.id}&competitionType=${competitionType}&problemRange=fixed`,
      {
        headers: {
          'CSRF-Token': csrfToken,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch problem');
    return response.json();
  };

  const fetchProblems = async (competitionType: string, csrfToken: string): Promise<Problem[]> => {
    const problems = [];
    const selectedProblemIds: string[] = [];

    // Fetch first two problems (1-10)
    for (let i = 0; i < 2; i++) {
      const problem = await fetchProblem('1-10', competitionType, selectedProblemIds, csrfToken);
      problems.push(problem);
      selectedProblemIds.push(problem.id);
    }

    // Fetch next two problems (11-20)
    for (let i = 0; i < 2; i++) {
      const problem = await fetchProblem('11-20', competitionType, selectedProblemIds, csrfToken);
      problems.push(problem);
      selectedProblemIds.push(problem.id);
    }

    // Fetch last problem (21-25)
    const problem = await fetchProblem('21-25', competitionType, selectedProblemIds, csrfToken);
    problems.push(problem);

    return problems;
  };

  const fetchProblem = async (
    problemRange: string,
    competitionType: string,
    excludeIds: string[],
    csrfToken: string
  ): Promise<Problem> => {
    const response = await fetch(
      `/api/amc_problems?userId=${user.id}&competitionType=${competitionType}&problemRange=${problemRange}&excludeIds=${excludeIds.join(',')}`,
      {
        headers: {
          'CSRF-Token': csrfToken,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch problems');
    return response.json();
  };

  const handleAnswer = (value: string) => {
    if (currentProblem) {
      setUserAnswers(prev => ({
        ...prev,
        [currentIndex]: value,
      }));
    }
  };

  const submitGame = async () => {
    if (!user) return;

    const results = calculateResults();
    try {
      await saveGameResults(results);
      setScore(results.correctAnswers);
      setShowResults(true);
      setGameStatus('complete');
      setElapsedTime(Date.now() - startTime);
      setGameCompleted(true); // Set gameCompleted flag to true after submission
      //console.info(gameCompleted)
    } catch (error) {
      console.error('Error saving game results:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save game results. Please try again.',
      });
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let noAnswers = 0;

    selectedProblems.forEach((problem, index) => {
      if (!userAnswers[index]) {
        noAnswers++;
      } else if (userAnswers[index] === problem.answer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    return { correctAnswers, incorrectAnswers, noAnswers };
  };

  const saveGameResults = async (results: {
    correctAnswers: number;
    incorrectAnswers: number;
    noAnswers: number;
  }) => {
    const csrfResponse = await fetch('/api/csrf-token');
    const { csrfToken } = await csrfResponse.json();

    const gameResultResponse = await fetch('/api/amc-game-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        userId: user.id,
        competitionType: currentCompetitionType,
        questionsCount: TOTAL_PROBLEMS,
        ...results,
        timeTakenInMs: Date.now() - startTime,
        tutorMode: tutorMode, // Added tutorMode to the request body
      }),
    });

    const gameResult = await gameResultResponse.json();

    await saveQuestionResults(gameResult.id, csrfToken);
  };

  const saveQuestionResults = async (gameId: string, csrfToken: string) => {
    await fetch('/api/amc-game-question-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        gameId,
        userId: user.id,
        questionResults: selectedProblems.map((problem, index) => ({
          problemId: problem.id,
          userAnswer: userAnswers[index] || null,
          userScore: userAnswers[index] === problem.answer ? 1 : 0,
        })),
      }),
    });
  };

  const currentProblem = selectedProblems[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">AMC Challenges</h1>
          <div className="flex gap-2">
            {!showProblem && (
              <>
                <Button onClick={() => startGame('AMC 8', true)} className="bg-primary hover:bg-primary/90">
                  AMC Tutor
                </Button>
                <Button onClick={() => setLocation('/')} className="bg-primary hover:bg-primary/90">
                  Back to Main
                </Button>
              </>
            )}
          </div>
        </div>
        <Separator className="my-4" />

        {/* Main Content */}
        {!showProblem ? (
          <div className="space-y-4">
            {user && (
              <div className="relative p-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg shadow-sm border border-purple-200 mb-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <Clock className="w-6 h-6 text-purple-600 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                  </div>
                  <div className="text-lg font-semibold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                    <AmcScreenTime userId={user.id} gameCompleted={gameCompleted}/>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-4 items-center max-w-md mx-auto">
                {['AMC 8 Lite', 'AMC 8', 'AMC 10', 'AMC 12'].map(type => (
                  <div key={type} className="flex items-center justify-between w-full gap-4">
                    <Button size="lg" onClick={() => startGame(type)} className="w-48">
                      {type}
                    </Button>
                    <AmcGamesPlayed userId={user.id} competitionType={type} excludeTutorMode={true} /> {/* Added excludeTutorMode prop */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : showResults ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Game Complete!</h2>
            <p className="text-xl text-center">
              Your score: {score} out of {selectedProblems.length}
            </p>
            <p className="text-xl text-center">Time Taken: {formatTime(elapsedTime)}</p>
            {score === TOTAL_PROBLEMS && <AchievementsDisplay elapsedTime={elapsedTime} />}
            <ProblemResults
              problems={selectedProblems}
              userAnswers={userAnswers}
              onReview={index => {
                setCurrentIndex(index);
                setShowResults(false);
              }}
            />
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowProblem(false)}>Exit Game</Button>
              <Button onClick={() => startGame(currentCompetitionType, tutorMode)}>Play Again</Button>
            </div>
          </div>
        ) : (
          <GameContent
            currentProblem={currentProblem}
            currentIndex={currentIndex}
            totalProblems={TOTAL_PROBLEMS}
            gameStatus={gameStatus}
            startTime={startTime}
            answeredCount={answeredCount}
            onPrevious={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setCurrentIndex(prev => prev + 1)}
            onAnswer={handleAnswer}
            userAnswers={userAnswers}
            onSubmit={submitGame}
            onExit={() => setShowProblem(false)}
            onShowResults={() => setShowResults(true)}
            selectedProblems={selectedProblems}
          />
        )}
      </Card>
    </div>
  );
}

function AchievementsDisplay({ elapsedTime }: { elapsedTime: number }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center">Achievements Earned</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AchievementBadge
          achievement={ACHIEVEMENTS.find(a => a.id === 'amc-scholar')}
          animate={true}
        />
        {elapsedTime < 8 * 60 * 1000 && (
          <AchievementBadge
            achievement={ACHIEVEMENTS.find(a => a.id === 'amc-expert')}
            animate={true}
          />
        )}
        {elapsedTime < 5 * 60 * 1000 && (
          <AchievementBadge
            achievement={ACHIEVEMENTS.find(a => a.id === 'amc-master')}
            animate={true}
          />
        )}
      </div>
    </div>
  );
}

function ProblemResults({
  problems,
  userAnswers,
  onReview,
}: {
  problems: Problem[];
  userAnswers: { [key: number]: string };
  onReview: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {problems.map((problem, idx) => (
        <div
          key={problem.id}
          className="p-4 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onReview(idx)}
        >
          <p>
            Problem {idx + 1}:{' '}
            {userAnswers[idx] ? (
              userAnswers[idx] === problem.answer ? (
                <span className="text-green-600">Correct</span>
              ) : (
                <span className="text-red-600">Incorrect (Answer: {problem.answer})</span>
              )
            ) : (
              <span className="text-gray-600">Not answered (Answer: {problem.answer})</span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">Click to review</p>
        </div>
      ))}
    </div>
  );
}

function GameContent({
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
}: {
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
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center w-full mb-4">
          <div className="text-sm text-grey-500">
            <div>
              Year {currentProblem?.year} - Problem {currentProblem?.problem_number}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-grey-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                {gameStatus === 'inProgress' && <Timer startTime={startTime} />}
              </div>
            </div>
            {gameStatus === 'inProgress' && <SubmitButton onSubmit={onSubmit} answeredCount={answeredCount} totalProblems={selectedProblems.length} selectedProblems={selectedProblems} />}
          </div>
        </div>
        <div className="space-y-4">
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
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
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
            <ExitButton gameStatus={gameStatus} onExit={onExit} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({
  onSubmit,
  answeredCount,
  totalProblems,
  selectedProblems,
}: {
  onSubmit: () => void;
  answeredCount: number;
  totalProblems: number;
  selectedProblems: Problem[];
}) {
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

function ExitButton({ gameStatus, onExit }: { gameStatus: string; onExit: () => void }) {
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