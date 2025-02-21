
import { useQuery } from '@tanstack/react-query';

interface AmcScreenTimeProps {
  userId: number;
}

export function AmcScreenTime({ userId }: AmcScreenTimeProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['amc-screen-time', userId],
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
