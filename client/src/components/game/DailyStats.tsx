
import { useEffect, useState } from 'react';
import { GamepadIcon } from 'lucide-react';

interface DailyStats {
  easy_count: number;
  hard_count: number;
}

export function DailyStats({ userId }: { userId: number }) {
  const [stats, setStats] = useState<DailyStats | null>(null);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/daily-stats?userId=${userId}&timezone=${timezone}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [userId]);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2">
      <GamepadIcon className="w-4 h-4 shrink-0" />
      <div className="space-x-4">
        <span>Easy: {stats.easy_count}</span>
        <span>Hard: {stats.hard_count}</span>
      </div>
    </div>
  );
}
