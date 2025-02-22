// AchievementsDisplay.tsx
import { AchievementBadge } from '@/components/game/AchievementBadge';
import { ACHIEVEMENTS } from '@/lib/achievements';

interface AchievementsDisplayProps {
  elapsedTime: number;
}

export function AchievementsDisplay({ elapsedTime }: AchievementsDisplayProps) {
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