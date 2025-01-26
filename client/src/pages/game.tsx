import { useState, useEffect } from "react";
import { FlashCard } from "@/components/game/FlashCard";
import { NumberInput } from "@/components/game/NumberInput";
import { ProgressBar } from "@/components/game/ProgressBar";
import { Achievements } from "@/components/game/Achievements";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GameState, Question, Difficulty, generateQuestions, checkAnswer, formatTime, calculateScore } from "@/lib/game";
import { triggerConfetti, triggerCelebration } from "@/lib/confetti";
import { X, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [themeColor, setThemeColor] = useState("#7c3aed"); // Default purple color
  const { toast } = useToast();

  const updateThemeColor = (color: string) => {
    setThemeColor(color);
    // Convert hex to HSL
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

  const startGame = (difficulty: Difficulty) => {
    setGameState({
      currentQuestion: 0,
      questions: generateQuestions(difficulty),
      startTime: Date.now(),
      score: 0,
      difficulty,
      streak: 0,
      themeColor
    });
  };

  const handleAnswer = async (answer: number) => {
    if (!gameState) return;

    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const correct = checkAnswer(currentQuestion, answer);

    if (correct) {
      triggerConfetti();
      toast({
        title: "Correct!",
        description: "Great job! Keep going!",
        variant: "default",
      });

      if (gameState.currentQuestion === gameState.questions.length - 1) {
        const endTime = Date.now();
        setGameState({
          ...gameState,
          endTime,
          currentQuestion: gameState.currentQuestion + 1,
          score: calculateScore(gameState.score + 1, endTime - gameState.startTime),
          streak: gameState.streak + 1
        });
        triggerCelebration();
      } else {
        setGameState({
          ...gameState,
          currentQuestion: gameState.currentQuestion + 1,
          score: gameState.score + 1,
          streak: gameState.streak + 1
        });
      }
    } else {
      toast({
        title: "Try again!",
        description: "Keep practicing!",
        variant: "destructive",
      });
      setGameState({
        ...gameState,
        streak: 0
      });
    }
  };

  const handleQuit = () => {
    setGameState(null);
    toast({
      title: "Game ended",
      description: "You can start a new game anytime!",
      variant: "default",
    });
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-primary mb-8">Math Challenge!</h1>

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
              Hard Mode (1-20)
            </Button>
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
          <div className="w-full max-w-md flex justify-between items-center">
            <ProgressBar
              current={gameState.currentQuestion + 1}
              total={gameState.questions.length}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleQuit}
              className="ml-4"
              title="Quit game"
            >
              <X className="h-5 w-5" />
            </Button>
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
          <h2 className="text-4xl font-bold text-primary">Amazing Job! 🎉</h2>
          <Achievements
            score={gameState.score}
            streak={gameState.streak}
            time={formatTime(gameState.endTime! - gameState.startTime)}
          />
          <div className="space-x-4">
            <Button
              size="lg"
              onClick={() => startGame(gameState.difficulty)}
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
              Change Difficulty
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}