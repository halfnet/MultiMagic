
import { useQuery } from '@tanstack/react-query';

export function AmcScreenTime({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: ['amcScreenTime', userId],
    queryFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/amc-screen-time?userId=${userId}&timezone=${timezone}`);
      if (!response.ok) throw new Error('Failed to fetch AMC screen time');
      return response.json();
    },
  });

  return (
    <div className="text-sm text-muted-foreground">
      {data?.screenTime ?? 0} mins earned this wk
    </div>
  );
}
