
import { useQuery } from '@tanstack/react-query';

export function AmcScreenTime({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['amcScreenTime', userId],
    queryFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/amc-screen-time?userId=${userId}&timezone=${timezone}`);
      if (!response.ok) throw new Error('Failed to fetch AMC screen time');
      return response.json();
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-sm text-muted-foreground">Error loading screen time</div>;

  return (
    <div className="text-sm text-muted-foreground">
      {(data?.screenTime || 0).toFixed(1)} mins of AMC screen time earned this week
    </div>
  );
}
