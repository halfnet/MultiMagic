// amc.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCookieAuth } from '@/hooks/use-cookie-auth';
import { GameStartScreen } from '@/components/amc/GameStartScreen';
import { GameResults } from '@/components/amc/GameResults';
import { GamePlay } from '@/components/amc/GamePlay';
import { Problem } from '@/components/amc/types';

const TOTAL_PROBLEMS = 5;

export default function AMCPage() {
  const [location, setLocation] = useLocation();
  const { user } = useCookieAuth();
  const { toast } = useToast();

  // Game state
  const [showProblem, setShowProblem] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'inProgress' | 'complete'>('inProgress');
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCompetitionType, setCurrentCompetitionType] = useState('AMC 8');
  const [tutorMode, setTutorMode] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    console.info("gameCompleted updated to:", gameCompleted);
  }, [gameCompleted]);

  const fetchCsrfToken = async () => {
    const response = await fetch('/api/csrf-token');
    const { csrfToken } = await response.json();
    return csrfToken;
  };

  const fetchProblem = async (
    problemRange: string,
    competitionType: string,
    excludeIds: string[],
    csrfToken: string
  ): Promise<Problem> => {
    const response = await fetch(
      `/api/amc_problems?userId=${user.id}&competitionType=${competitionType}&problemRange=${problemRange}&excludeIds=${excludeIds.join(',')}`,
      { headers: { 'CSRF-Token': csrfToken } }
    );
    if (!response.ok) throw new Error('Failed to fetch problems');
    return response.json();
  };

  const fetchProblems = async (competitionType: string, csrfToken: string): Promise<Problem[]> => {
    const problems: Problem[] = [];
    const selectedProblemIds: string[] = [];

    for (const range of ['1-10', '1-10', '11-20', '11-20', '21-25']) {
      const problem = await fetchProblem(range, competitionType, selectedProblemIds, csrfToken);
      problems.push(problem);
      selectedProblemIds.push(problem.id);
    }

    return problems;
  };

  const startGame = async (competitionType: string = 'AMC 8', isTutor: boolean = false) => {
    try {
      setCurrentCompetitionType(competitionType);
      setGameStatus('inProgress');
      setTutorMode(isTutor);
      setGameCompleted(false);

      const csrfToken = await fetchCsrfToken();
      const problems = isTutor 
        //? [await fetchProblem('fixed-AMC 8-2011-10', competitionType, [], csrfToken)]
        ? [await fetchProblem('1-25', competitionType, [], csrfToken)]
        : await fetchProblems(competitionType, csrfToken);

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

  const handleAnswer = (value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: value,
    }));
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let noAnswers = 0;

    selectedProblems.forEach((problem, index) => {
      if (!userAnswers[index]) noAnswers++;
      else if (userAnswers[index] === problem.answer) correctAnswers++;
      else incorrectAnswers++;
    });

    return { correctAnswers, incorrectAnswers, noAnswers };
  };

  const saveGameResults = async (results: ReturnType<typeof calculateResults>) => {
    const csrfToken = await fetchCsrfToken();
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
        tutorMode,
      }),
    });

    const gameResult = await gameResultResponse.json();
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
      setGameCompleted(true);
    } catch (error) {
      console.error('Error saving game results:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save game results. Please try again.',
      });
    }
  };

  const renderContent = () => {
    if (!showProblem) {
      return (
        <GameStartScreen
          user={user}
          gameCompleted={gameCompleted}
          onStartGame={startGame}
          onBack={() => setLocation('/')}
        />
      );
    }

    if (showResults) {
      return (
        <GameResults
          score={score}
          elapsedTime={elapsedTime}
          problems={selectedProblems}
          userAnswers={userAnswers}
          onReview={(index) => {
            setCurrentIndex(index);
            setShowResults(false);
          }}
          onExit={() => setShowProblem(false)}
          onPlayAgain={() => startGame(currentCompetitionType, tutorMode)}
        />
      );
    }

    return (
      <GamePlay
        currentProblem={selectedProblems[currentIndex]}
        currentIndex={currentIndex}
        totalProblems={TOTAL_PROBLEMS}
        gameStatus={gameStatus}
        startTime={startTime}
        answeredCount={Object.keys(userAnswers).length}
        userAnswers={userAnswers}
        tutorMode={tutorMode}
        selectedProblems={selectedProblems}
        onPrevious={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setCurrentIndex(prev => Math.min(selectedProblems.length - 1, prev + 1))}
        onAnswer={handleAnswer}
        onSubmit={submitGame}
        onExit={() => setShowProblem(false)}
        onShowResults={() => setShowResults(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-4xl w-full">{renderContent()}</Card>
    </div>
  );
}