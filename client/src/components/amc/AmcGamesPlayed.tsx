
import { useState, useEffect } from 'react';

interface AmcGamesPlayedProps {
  userId: number;
  competitionType: string;
  excludeTutorMode?: boolean;
}

export function AmcGamesPlayed({ userId, competitionType, excludeTutorMode = true }: AmcGamesPlayedProps) {
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/amc-games-played?userId=${userId}&timezone=${timezone}&excludeTutorMode=${excludeTutorMode}`)
      .then(res => res.json())
      .then(data => setGamesPlayed(data[competitionType] || 0))
      .catch(error => {
        console.error('Error fetching games played:', error);
        setGamesPlayed(0);
      });
  }, [userId, competitionType, excludeTutorMode]);

  return <div className="text-sm text-gray-500">{gamesPlayed} games played</div>;
}
