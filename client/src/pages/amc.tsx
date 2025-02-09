import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCookieAuth } from '@/hooks/use-cookie-auth';
import { AchievementBadge } from '@/components/game/AchievementBadge';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { Clock } from 'lucide-react';
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

function AmcGamesPlayed({ userId, competitionType }: { userId: number, competitionType: string }) {
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/amc-games-played?userId=${userId}&timezone=${timezone}`)
      .then(res => res.json())
      .then(data => setGamesPlayed(data[competitionType] || 0))
      .catch(console.error);
  }, [userId, competitionType]);

  return (
    <div className="text-sm text-gray-500">
      {gamesPlayed} games played
    </div>
  );
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
    <div className="text-base text-gray-500 text-[1.15rem]">
      {startTime > 0 ? formatTime(elapsedTime) : '00:00'}
    </div>
  );
}


function AmcScreenTime({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['amc-screen-time', userId],
    queryFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/amc-screen-time?userId=${userId}&timezone=${timezone}`);
      if (!response.ok) throw new Error('Failed to fetch AMC screen time');
      return response.json();
    }
  });

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center">Error loading screen time</p>;

  return (
    <p className="text-center">
      {(data?.screenTime || 0).toFixed(1)} mins of screen time earned this week
    </p>
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


  const startGame = async (competitionType: string = "AMC 8") => {
    try {
      setGameStatus('inProgress');
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      let problems = [];

      const selectedProblemIds: string[] = [];

      // Fetch first two problems (1-10)
      for (let i = 0; i < 2; i++) {
        const response = await fetch(`/api/amc_problems?userId=${user.id}&competitionType=${competitionType}&problemRange=1-10&excludeIds=${selectedProblemIds.join(',')}`, {
          headers: {
            'CSRF-Token': csrfToken
          }
        });
        if (!response.ok) throw new Error('Failed to fetch problems');
        const problem = await response.json();
        problems.push(problem);
        selectedProblemIds.push(problem.id);
      }

      // Fetch next two problems (11-20)
      for (let i = 0; i < 2; i++) {
        const response = await fetch(`/api/amc_problems?userId=${user.id}&competitionType=${competitionType}&problemRange=11-20&excludeIds=${selectedProblemIds.join(',')}`, {
          headers: {
            'CSRF-Token': csrfToken
          }
        });
        if (!response.ok) throw new Error('Failed to fetch problems');
        const problem = await response.json();
        problems.push(problem);
        selectedProblemIds.push(problem.id);
      }

      // Fetch last problem (21-25)
      const response = await fetch(`/api/amc_problems?userId=${user.id}&competitionType=${competitionType}&problemRange=21-25&excludeIds=${selectedProblemIds.join(',')}`, {
        headers: {
          'CSRF-Token': csrfToken
        }
      });
      if (!response.ok) throw new Error('Failed to fetch problems');
      const problem = await response.json();
      problems.push(problem);

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
          competitionType: selectedProblems[0].competition_type, // Use competition type from fetched problems
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
        <Separator className="my-4" />

        {!showProblem ? (
          <div className="space-y-4">
            {user && <AmcScreenTime userId={user.id} />}
            <div className="space-y-4">
              <div className="flex flex-col gap-4 items-center max-w-md mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between w-full gap-4">
                    <Button 
                      size="lg" 
                      onClick={startGame}
                      className="w-48"
                    >
                      AMC 8
                    </Button>
                    <AmcGamesPlayed userId={user.id} competitionType="AMC 8" />
                  </div>
                  <div className="flex items-center justify-between w-full gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => startGame("AMC 8 Lite")}
                      className="w-48"
                    >
                      AMC 8 Lite
                    </Button>
                    <AmcGamesPlayed userId={user.id} competitionType="AMC 8 Lite" />
                  </div>
                </div>
                <div className="flex items-center justify-between w-full gap-4">
                  <Button size="lg" disabled className="w-48">
                    AMC 10 (Coming Soon)
                  </Button>
                  <div className="text-sm text-gray-500">0 games played</div>
                </div>
                <div className="flex items-center justify-between w-full gap-4">
                  <Button size="lg" disabled className="w-48">
                    AMC 12 (Coming Soon)
                  </Button>
                  <div className="text-sm text-gray-500">0 games played</div>
                </div>
              </div>
            </div>
          </div>
        ) : showResults ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Game Complete!</h2>
            <p className="text-xl text-center">Your score: {score} out of {TOTAL_PROBLEMS}</p>
            <p className="text-xl text-center">Time Taken: {formatTime(elapsedTime)}</p>
            {score === TOTAL_PROBLEMS && (
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
            )}
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
              <div className="flex justify-between items-center w-full mb-4">
                <div className="text-sm text-grey-500 space-y-1">
                  <div>Year {currentProblem?.year} - Problem {currentProblem?.problem_number}</div>
                  <div>Problem {currentIndex + 1} of {TOTAL_PROBLEMS}</div>                  
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-grey-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      {gameStatus === 'inProgress' && <Timer startTime={startTime} />}
                    </div>
                    <div>Answered: {answeredCount}</div>
                  </div>
                  {gameStatus === 'inProgress' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          Submit Answers
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Submit Answers?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {answeredCount < TOTAL_PROBLEMS ? 
                              `You have answered ${answeredCount} out of ${TOTAL_PROBLEMS} questions. Are you sure you want to submit?` :
                              'Are you ready to submit your answers?'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={submitGame} className="bg-primary hover:bg-primary/90">Submit</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div
                  className="[&_img]:inline-block [&_img]:align-middle [&_img]:mx-1"
                  dangerouslySetInnerHTML={{ __html: currentProblem?.question_html || '' }}
                />
                <div className="mt-4 mx-auto">
                <div className="flex w-1/2 justify-between items-center">
                  {['A', 'B', 'C', 'D', 'E'].map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="radio"
                        id={`option-${option}`}
                        name="answer"
                        value={option}
                        checked={userAnswers[currentIndex] === option}
                        onChange={(e) => handleAnswer(e.target.value)}
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
                  <div className="flex items-center gap-4">
                    {gameStatus === 'complete' && (
                      <Button
                        onClick={() => setShowResults(true)}
                        className="bg-primary/90 hover:bg-primary text-primary-foreground"
                      >
                        Go to Results
                      </Button>
                    )}
                  </div>
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