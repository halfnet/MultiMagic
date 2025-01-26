import { Trophy, Star, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AchievementsProps {
  score: number;
  streak: number;
  time: string;
}

export function Achievements({ score, streak, time }: AchievementsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 flex flex-col items-center">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-sm text-gray-600">Total Score</div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4 flex flex-col items-center">
          <Star className="w-8 h-8 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{Math.max(streak, gameState?.bestStreak || 0)}</div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4 flex flex-col items-center">
          <Timer className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{time}</div>
          <div className="text-sm text-gray-600">Time</div>
        </Card>
      </motion.div>
    </div>
  );
}
