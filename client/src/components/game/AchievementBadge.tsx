import { Brain, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Achievement } from '@/lib/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  animate?: boolean;
}

const iconMap = {
  Brain,
  Clock,
  Star,
};

export function AchievementBadge({ achievement, animate = false }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon as keyof typeof iconMap];

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Card className="p-4 flex flex-col items-center bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200">
          <Icon className="w-8 h-8 text-yellow-500 mb-2" />
          <h3 className="font-bold text-lg text-center">{achievement.name}</h3>
          <p className="text-sm text-gray-600 text-center mt-1">{achievement.description}</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="p-4 flex flex-col items-center">
      <Icon className="w-8 h-8 text-yellow-500 mb-2" />
      <h3 className="font-bold text-lg text-center">{achievement.name}</h3>
      <p className="text-sm text-gray-600 text-center mt-1">{achievement.description}</p>
    </Card>
  );
}
