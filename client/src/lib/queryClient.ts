import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const csrfResponse = await fetch('/api/csrf-token', {
          credentials: 'include',
        });
        const { csrfToken } = await csrfResponse.json();

        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
          headers: {
            'CSRF-Token': csrfToken,
          },
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
