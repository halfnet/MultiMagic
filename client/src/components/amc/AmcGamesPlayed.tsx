
import { useState, useEffect } from 'react';

interface AmcGamesPlayedProps {
  userId: number;
  competitionType: string;
}

export function AmcGamesPlayed({ userId, competitionType }: AmcGamesPlayedProps) {
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/amc-games-played?userId=${userId}&timezone=${timezone}`)
      .then(res => res.json())
      .then(data => setGamesPlayed(data[competitionType] || 0))
      .catch(console.error);
  }, [userId, competitionType]);

  return <div className="text-sm text-gray-500">{gamesPlayed} games played</div>;
}
