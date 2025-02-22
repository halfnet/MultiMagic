import { useQuery } from '@tanstack/react-query';

interface AmcScreenTimeProps {
  userId: number;
  gameCompleted: boolean; // Add this to react to game completion
}

export function AmcScreenTime({ userId, gameCompleted }: AmcScreenTimeProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['amc-screen-time', userId, gameCompleted], // Include gameCompleted in queryKey
    queryFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/amc-screen-time?userId=${userId}&timezone=${timezone}`);
      if (!response.ok) throw new Error('Failed to fetch AMC screen time');
      return response.json();
    },
  });

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center">Error loading screen time</p>;

  return (
    <p className="text-center">
      {(data?.screenTime || 0).toFixed(1)} mins of screen time earned this week
    </p>
  );
}