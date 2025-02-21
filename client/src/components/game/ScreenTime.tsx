
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
      .then(data => {
        const { easyTime = 0, hardTime = 0 } = data;
        const cappedEasyTime = Math.min(easyTime, 10); // Cap easy mode at 10 minutes
        setScreenTime(cappedEasyTime + hardTime);
      })
      .catch(console.error);
  }, [userId]);

  return (
    <span>{(screenTime || 0).toFixed(1)} mins earned this week</span>
  );
}
