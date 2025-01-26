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

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { toast } = useToast();

  const startGame = (difficulty: Difficulty) => {
    setGameState({
      currentQuestion: 0,
      questions: generateQuestions(difficulty),
      startTime: Date.now(),
      score: 0,
      difficulty,
      streak: 0
    });
  };

  const handleAnswer = (answer: number) => {
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
        description: `The correct answer was ${currentQuestion.answer}`,
        variant: "destructive",
      });
      setGameState({
        ...gameState,
        streak: 0
      });
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-primary mb-8">Math Challenge!</h1>
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
          <ProgressBar
            current={gameState.currentQuestion + 1}
            total={gameState.questions.length}
          />
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
          <Button
            size="lg"
            onClick={() => startGame(gameState.difficulty)}
            className="text-lg"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}
