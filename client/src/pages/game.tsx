import { useState, useEffect } from "react";
import { FlashCard } from "@/components/game/FlashCard";
import { NumberInput } from "@/components/game/NumberInput";
import { ProgressBar } from "@/components/game/ProgressBar";
import { Achievements } from "@/components/game/Achievements";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCookieAuth } from "@/hooks/use-cookie-auth";
import { GameState, Question, Difficulty, GameMode, generateQuestions, checkAnswer, formatTime, calculateScore } from "@/lib/game";
import { triggerConfetti, triggerCelebration } from "@/lib/confetti";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/audio";
import { X, Palette, Brain } from "lucide-react";
import { Achievement, ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";
import { AchievementBadge } from "@/components/game/AchievementBadge";
import { Timer } from "@/components/game/Timer";
import { nanoid } from 'nanoid';

interface QuestionState {
  attempts: number;
  startTime: number;
  endTime?: number;
  numbersUsed: number[];
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [themeColor, setThemeColor] = useState("#7c3aed");
  const [practiceDigit, setPracticeDigit] = useState<number>(5);
  const [practiceQuestionCount, setPracticeQuestionCount] = useState<number>(5);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { user } = useCookieAuth();
  const [gameId, setGameId] = useState<string>('');

  const updateThemeColor = (color: string) => {
    setThemeColor(color);
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    document.documentElement.style.setProperty(
      "--primary",
      `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    );
  };

  const startGame = (difficulty: Difficulty, mode: GameMode = 'regular') => {
    const questions = generateQuestions(difficulty, mode === 'practice' ? practiceQuestionCount : 10, mode === 'practice' ? practiceDigit : undefined);
    const questionStates = questions.map(() => ({
      attempts: 1,
      startTime: 0, 
      numbersUsed: [0, 0] 
    }));

    const newGameId = nanoid();
    setGameId(newGameId);

    setGameState({
      gameId: newGameId,
      currentQuestion: 0,
      questions,
      startTime: Date.now(),
      difficulty,
      streak: 0,
      bestStreak: 0,
      themeColor,
      mode,
      practiceDigit: mode === 'practice' ? practiceDigit : undefined,
      achievementsEarned: [],
      lastEarnedAchievement: undefined,
      incorrectAttempts: 0,
      questionStates
    });

    setTimeout(() => {
      if (questionStates.length > 0) {
        const newQuestionStates = [...questionStates];
        newQuestionStates[0] = {
          ...newQuestionStates[0],
          startTime: Date.now(),
          numbersUsed: [questions[0].num1, questions[0].num2]
        };
        setGameState(prev => ({
          ...prev,
          questionStates: newQuestionStates
        }));
      }
    }, 0);
  };

  const handleAnswer = async (answer: number) => {
    if (!gameState || !user) return;

    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const correct = checkAnswer(currentQuestion, answer);
    const questionState = gameState.questionStates[gameState.currentQuestion];

    if (questionState.startTime === 0) {
      const newQuestionStates = [...gameState.questionStates];
      newQuestionStates[gameState.currentQuestion] = {
        ...questionState,
        startTime: Date.now(),
        numbersUsed: [currentQuestion.num1, currentQuestion.num2]
      };
      setGameState({
        ...gameState,
        questionStates: newQuestionStates
      });
      return; 
    }

    if (!correct) {
      await playIncorrectSound();
      const newQuestionStates = [...gameState.questionStates];
      newQuestionStates[gameState.currentQuestion] = {
        ...questionState,
        attempts: questionState.attempts + 1
      };
      setGameState({
        ...gameState,
        questionStates: newQuestionStates,
        incorrectAttempts: gameState.incorrectAttempts + 1,
        streak: 0
      });
      return;
    }

    const newQuestionStates = [...gameState.questionStates];
    const endTime = Date.now();
    newQuestionStates[gameState.currentQuestion] = {
      ...questionState,
      endTime,
    };

    await playCorrectSound();
    triggerConfetti();

    const isLastQuestion = gameState.currentQuestion === gameState.questions.length - 1;
    const newStreak = gameState.streak + 1;
    let newGameState = {
      ...gameState,
      currentQuestion: gameState.currentQuestion + 1,
      streak: newStreak,
      bestStreak: Math.max(newStreak, gameState.bestStreak),
      questionStates: newQuestionStates
    };

    if (!isLastQuestion) {
      const nextQuestion = gameState.questions[gameState.currentQuestion + 1];
      newQuestionStates[gameState.currentQuestion + 1] = {
        ...newQuestionStates[gameState.currentQuestion + 1],
        startTime: Date.now(),
        numbersUsed: [nextQuestion.num1, nextQuestion.num2]
      };
    }

    if (isLastQuestion) {
      const gameEndTime = Date.now();
      await playCompleteSound();

      newGameState = {
        ...newGameState,
        endTime: gameEndTime
      };

      try {
        const questionResults = gameState.questions.map((q, i) => ({
          questionId: i + 1,
          gameId: gameState.gameId,
          userId: user.id,
          attempts: newGameState.questionStates[i].attempts,
          timeTaken: newGameState.questionStates[i].endTime! - newGameState.questionStates[i].startTime,
          numbersUsed: [q.num1, q.num2],
        }));

        await fetch('/api/game-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameState.gameId,
            userId: user.id,
            difficulty: gameState.difficulty,
            mode: gameState.mode,
            practiceDigit: gameState.practiceDigit,
            questionsCount: gameState.questions.length,
            correctAnswers: gameState.currentQuestion,
            timeTakenInMs: gameEndTime - gameState.startTime,
            bestStreak: gameState.bestStreak,
            incorrectAttempts: gameState.incorrectAttempts,
          }),
        });

        await fetch('/api/game-question-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameState.gameId,
            userId: user.id,
            questionResults
          }),
        });
      } catch (error) {
        console.error('Failed to save game results:', error);
      }

      setShowResults(false);

      const earnedAchievements = [];
      for (const achievement of ACHIEVEMENTS) {
        if (!gameState.achievementsEarned.includes(achievement.id) && achievement.condition(newGameState)) {
          earnedAchievements.push(achievement);
        }
      }

      if (earnedAchievements.length > 0) {
        const lastEarned = earnedAchievements[earnedAchievements.length - 1];
        newGameState = {
          ...newGameState,
          achievementsEarned: [
            ...gameState.achievementsEarned,
            ...earnedAchievements.map(a => a.id)
          ],
          lastEarnedAchievement: lastEarned
        };

        earnedAchievements.forEach(achievement => {
          toast({
            title: "Achievement Unlocked! 🏆",
            description: `${achievement.name} - ${achievement.description}`,
            variant: "default",
          });
        });
      }

      triggerCelebration();
      setTimeout(() => {
        setShowResults(true);
      }, 2500);
    } else {
      const newAchievement = checkAchievements(newGameState, gameState.achievementsEarned);
      if (newAchievement) {
        newGameState = {
          ...newGameState,
          achievementsEarned: [...gameState.achievementsEarned, newAchievement.id],
          lastEarnedAchievement: newAchievement
        };
        toast({
          title: "Achievement Unlocked! 🏆",
          description: `${newAchievement.name} - ${newAchievement.description}`,
          variant: "default",
        });
      }
    }

    setGameState(newGameState);
  };

  const handleQuit = () => {
    setGameState(null);
    toast({
      title: "Game ended",
      description: "You can start a new game anytime!",
      variant: "default",
    });
  };

  const handleLogout = () => {
    document.cookie = 'math_game_username=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.reload();
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-primary">Math Challenge!</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Playing as {user?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground"
              >
                Switch User
              </Button>
            </div>
          </div>
          <div className="mb-6 space-y-4">
            <Label htmlFor="color-picker" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Choose Your Color Theme
            </Label>
            <Input
              id="color-picker"
              type="color"
              value={themeColor}
              onChange={(e) => updateThemeColor(e.target.value)}
              className="w-full h-12 cursor-pointer"
            />
          </div>
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={() => startGame('easy')}
            >
              Easy Mode (1-9)
            </Button>
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={() => startGame('hard')}
            >
              Hard Mode (5-19)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Practice Mode</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="practice-digit" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Choose a number to practice:
                  </Label>
                  <Input
                    id="practice-digit"
                    type="number"
                    min={1}
                    max={20}
                    value={practiceDigit}
                    onChange={(e) => setPracticeDigit(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="question-count" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Number of questions:
                  </Label>
                  <Input
                    id="question-count"
                    type="number"
                    min={1}
                    max={50}
                    value={practiceQuestionCount}
                    onChange={(e) => setPracticeQuestionCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center"
                  />
                </div>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full text-lg"
                onClick={() => startGame('easy', 'practice')}
              >
                Practice Mode
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestion];
  const isGameComplete = gameState.currentQuestion === gameState.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4 space-y-8">
      {!isGameComplete ? (
        <>
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <ProgressBar
                  current={gameState.currentQuestion + 1}
                  total={gameState.questions.length}
                />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">
                  {user?.username}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleQuit}
                  className="ml-2"
                  title="Quit game"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              {gameState.mode === 'practice' && (
                <div className="text-sm text-muted-foreground">
                  Practicing multiplications with {gameState.practiceDigit}
                </div>
              )}
              <Timer startTime={gameState.startTime} />
            </div>
          </div>
          <FlashCard
            num1={currentQuestion.num1}
            num2={currentQuestion.num2}
            show={true}
          />
          <NumberInput onSubmit={handleAnswer} />
        </>
      ) : (
        <div className="space-y-8 text-center">
          {showResults ? (
            <>
              <h2 className="text-4xl font-bold text-primary">Amazing Job! 🎉</h2>
              <Achievements
                streak={gameState.streak}
                bestStreak={gameState.bestStreak}
                time={formatTime(gameState.endTime! - gameState.startTime)}
              />

              {gameState.achievementsEarned.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Achievements Earned</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ACHIEVEMENTS.filter(a => gameState.achievementsEarned.includes(a.id)).map(achievement => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        animate={achievement.id === gameState.lastEarnedAchievement?.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-x-4">
                <Button
                  size="lg"
                  onClick={() => startGame(gameState.difficulty, gameState.mode)}
                  className="text-lg"
                >
                  Play Again
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleQuit}
                  className="text-lg"
                >
                  Change Mode
                </Button>
              </div>
            </>
          ) : (
            <div className="animate-bounce text-4xl font-bold text-primary">
              🎉 Fantastic! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
}