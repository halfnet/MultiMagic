
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
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

export default function AMC() {
  const [_, setLocation] = useLocation();
  const [showProblem, setShowProblem] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'inProgress' | 'complete'>('inProgress');

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

  const submitGame = () => {
    let correctAnswers = 0;
    selectedProblems.forEach((problem, index) => {
      if (userAnswers[index] === problem.answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
    setGameStatus('complete');
  };

  const currentProblem = selectedProblems[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">AMC Challenges</h1>
          <div className="flex gap-2">
            {!showProblem ? (
              <Button
                onClick={() => setLocation('/')}
                className="bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                Back to Main
              </Button>
            ) : !showResults && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-primary/90 hover:bg-primary text-primary-foreground">
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
                    <AlertDialogAction onClick={() => setShowProblem(false)}>
                      Exit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              <div className="flex justify-between items-center">
                <div className="text-sm text-grey-500">
                  Problem {currentIndex + 1} of {TOTAL_PROBLEMS} | Answered: {answeredCount} of {TOTAL_PROBLEMS}
                </div>
                {answeredCount > 0 && gameStatus === 'inProgress' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
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
                        <AlertDialogAction onClick={submitGame}>Submit</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
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
                  >
                    <SelectTrigger className="w-[200px]">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
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
                        <AlertDialogAction onClick={() => setShowProblem(false)}>
                          Exit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
