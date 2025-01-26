import { useState, useEffect } from "react";
import { formatTime } from "@/lib/game";

interface TimerProps {
  startTime: number;
}

export function Timer({ startTime }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState("0:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(formatTime(elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="text-sm text-muted-foreground">
      Time: {elapsedTime}
    </div>
  );
}