
import { useEffect, useState } from 'react';

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
    <div className="text-sm text-muted-foreground space-x-4">
      <span>Today's games:</span>
      <span>Easy: {stats.easy_count}</span>
      <span>Hard: {stats.hard_count}</span>
    </div>
  );
}
