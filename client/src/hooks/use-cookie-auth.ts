import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { SelectUser } from '@db/schema';

const COOKIE_NAME = 'math_game_username';

export function useCookieAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUsername = document.cookie
      .split('; ')
      .find(row => row.startsWith(COOKIE_NAME))
      ?.split('=')[1];

    if (storedUsername) {
      loginMutation.mutate(storedUsername);
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (username: string) => {
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const user = await response.json();
      document.cookie = `${COOKIE_NAME}=${username}; path=/; max-age=31536000`; // 1 year
      return user;
    },
    onSuccess: user => {
      queryClient.setQueryData(['user'], user);
      toast({
        title: 'Welcome!',
        description: `Logged in as ${user.username}`,
      });

      // Apply saved theme color
      if (user.themeColor) {
        const color = user.themeColor;
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }

        document.documentElement.style.setProperty(
          '--primary',
          `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
        );
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { data: user } = useQuery<SelectUser>({
    queryKey: ['user'],
    enabled: false, // Only fetch through mutation
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
  };
}
