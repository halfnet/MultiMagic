
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ScreenTimeProps {
  userId: number;
}

export function ScreenTime({ userId }: ScreenTimeProps) {
  const [screenTime, setScreenTime] = useState<number>(0);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/screen-time?userId=${userId}&timezone=${timezone}`)
      .then(res => res.json())
      .then(data => setScreenTime(data.screenTime))
      .catch(console.error);
  }, [userId]);

  return (
    <span className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      {screenTime.toFixed(0)} mins
    </span>
  );
}
