// GameStartScreen.tsx
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock } from 'lucide-react';
import { AmcScreenTime } from '@/components/amc/AmcScreenTime';
import { AmcGamesPlayed } from '@/components/amc/AmcGamesPlayed';

interface GameStartScreenProps {
  user: any;
  gameCompleted: boolean;
  onStartGame: (type: string, isTutor?: boolean) => void;
  onBack: () => void;
}

export function GameStartScreen({ user, gameCompleted, onStartGame, onBack }: GameStartScreenProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">AMC Challenges</h1>
        <div className="flex gap-2">
          <Button onClick={() => onStartGame('AMC 8', true)} className="bg-primary hover:bg-primary/90">
            AMC Tutor
          </Button>
          <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
            Back to Main
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-4">
        {user && (
          <div className="relative p-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg shadow-sm border border-purple-200 mb-4">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <Clock className="w-6 h-6 text-purple-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
              </div>
              <div className="text-lg font-semibold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                <AmcScreenTime userId={user.id} gameCompleted={gameCompleted} />
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 items-center max-w-md mx-auto">
            {['AMC 8 Lite', 'AMC 8', 'AMC 10', 'AMC 12'].map(type => (
              <div key={type} className="flex items-center justify-between w-full gap-4">
                <Button size="lg" onClick={() => onStartGame(type)} className="w-48">
                  {type}
                </Button>
                <AmcGamesPlayed userId={user.id} competitionType={type} excludeTutorMode={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}