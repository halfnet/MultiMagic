
import { useState, useEffect } from 'react';
import { formatTime } from './utils';

interface TimerProps {
  startTime: number;
}

export function Timer({ startTime }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startTime > 0) {
        setElapsedTime(Date.now() - startTime);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <div className="text-base text-gray-500 text-[1.15rem]">
      {startTime > 0 ? formatTime(elapsedTime) : '00:00'}
    </div>
  );
}
