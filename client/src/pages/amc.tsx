import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCookieAuth } from '@/hooks/use-cookie-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";

interface Problem {
  id: number;
  year: number;
  competition_type: string;
  problem_number: number;
  question_html: string;
  answer: string;
}

const TOTAL_PROBLEMS = 5;

function formatTime(milliseconds: number): string {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedHours = hours > 0 ? `${hours}:` : '';

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}

function Timer({ startTime }: { startTime: number }) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startTime > 0) {
        setElapsedTime(Date.now() - startTime);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <div className="text-sm text-gray-500">
      {startTime > 0 ? formatTime(elapsedTime) : '00:00'}
    </div>
  );
}


export default function AMC() {
  const [_, setLocation] = useLocation();
  const { user } = useCookieAuth();
  const { toast } = useToast();
  const [showProblem, setShowProblem] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'inProgress' | 'complete'>('inProgress');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);


  const startGame = async () => {
    try {
      setGameStatus('inProgress');
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      let problems = [];
      let lastYear = 0;
      let lastProblem = 0;

      for (let i = 0; i < TOTAL_PROBLEMS; i++) {
        const response = await fetch(`/api/problems/amc8?year=${lastYear}&problem=${lastProblem}`, {
          headers: {
            'CSRF-Token': csrfToken
          }
        });

        if (!response.ok) throw new Error('Failed to fetch problems');
        const problem = await response.json();
        problems.push(problem);
        lastYear = problem.year;
        lastProblem = problem.problem_number;
      }

      setSelectedProblems(problems);
      setUserAnswers({});
      setCurrentIndex(0);
      setShowProblem(true);
      setShowResults(false);
      setScore(0);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleAnswer = (value: string) => {
    if (currentProblem) {
      setUserAnswers(prev => ({
        ...prev,
        [currentIndex]: value
      }));
    }
  };

  const submitGame = async () => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let noAnswers = 0;

    // Calculate totals
    selectedProblems.forEach((problem, index) => {
      if (!userAnswers[index]) {
        noAnswers++;
      } else if (userAnswers[index] === problem.answer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    try {
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      // Save game results
      const gameResultResponse = await fetch('/api/amc-game-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          userId: user.id,
          competitionType: 'AMC 8',
          questionsCount: TOTAL_PROBLEMS,
          correctAnswers,
          incorrectAnswers,
          noAnswers,
          timeTakenInMs: Date.now() - startTime,
        }),
      });

      const gameResult = await gameResultResponse.json();

      // Save individual question results
      await fetch('/api/amc-game-question-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          gameId: gameResult.id,
          userId: user.id,
          questionResults: selectedProblems.map((problem, index) => ({
            problemId: problem.id,
            userAnswer: userAnswers[index] || null,
            userScore: userAnswers[index] === problem.answer ? 1 : 0,
          })),
        }),
      });

      setScore(correctAnswers);
      setShowResults(true);
      setGameStatus('complete');
      setElapsedTime(Date.now() - startTime);
    } catch (error) {
      console.error('Error saving game results:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save game results. Please try again.",
      });
    }
  };

  const currentProblem = selectedProblems[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">AMC Challenges</h1>
          <div className="flex gap-2">
            {!showProblem && (
              <Button
                onClick={() => setLocation('/')}
                className="bg-primary hover:bg-primary/90"
              >
                Back to Main
              </Button>
            )}
          </div>
        </div>

        {!showProblem ? (
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={startGame}
            >
              AMC 8
            </Button>
            <Button size="lg" disabled>
              AMC 10 (Coming Soon)
            </Button>
          </div>
        ) : showResults ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Game Complete!</h2>
            <p className="text-xl text-center">Your score: {score} out of {TOTAL_PROBLEMS}</p>
            <p className="text-xl text-center">Time Taken: {formatTime(elapsedTime)}</p>
            <div className="space-y-4">
              {selectedProblems.map((problem, idx) => (
                <div 
                  key={problem.id} 
                  className="p-4 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowResults(false);
                  }}
                >
                  <p>Problem {idx + 1}: {
                    userAnswers[idx] ? 
                      (userAnswers[idx] === problem.answer ? 
                        <span className="text-green-600">Correct</span> : 
                        <span className="text-red-600">Incorrect (Answer: {problem.answer})</span>)
                      : <span className="text-gray-600">Not answered (Answer: {problem.answer})</span>
                  }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Click to review</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
                  <Button onClick={() => {
                      setShowProblem(false);
                      setShowResults(false);
                    }}>
                    Exit Game
                  </Button>
              <Button onClick={startGame}>
                Play Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-grey-500">
                  Problem {currentIndex + 1} of {TOTAL_PROBLEMS} | Answered: {answeredCount} of {TOTAL_PROBLEMS}
                </div>
                <Timer startTime={startTime} />
              </div>
              <div className="space-y-4">
                <div
                  className="[&_img]:inline-block [&_img]:align-middle [&_img]:mx-1"
                  dangerouslySetInnerHTML={{ __html: currentProblem?.question_html || '' }}
                />
                <div className="mt-4">
                  <Select
                    value={userAnswers[currentIndex] || ''}
                    onValueChange={handleAnswer}
                    disabled={gameStatus === 'complete'}
                    className="[&_[data-radix-select-trigger]]:bg-primary [&_[data-radix-select-trigger]]:text-primary-foreground [&_[data-radix-select-trigger]]:hover:bg-primary/90"
                  >
                    <SelectTrigger className="w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground">
                      <SelectValue placeholder="Select answer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D', 'E'].map((option) => (
                        <SelectItem key={option} value={option}>
                          Option {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                  >
                    Prev
                  </Button>
                  <Button 
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    disabled={currentIndex === TOTAL_PROBLEMS - 1}
                  >
                    Next
                  </Button>
                </div>
                <div className="flex gap-2">
                  {gameStatus === 'complete' && (
                    <Button
                      onClick={() => setShowResults(true)}
                      className="bg-primary/90 hover:bg-primary text-primary-foreground"
                    >
                      Go to Results
                    </Button>
                  )}
                  {gameStatus === 'inProgress' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                          <AlertDialogAction onClick={() => setShowProblem(false)} className="bg-primary hover:bg-primary/90">
                            Exit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setShowProblem(false)}
                    >
                      Exit Game
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}