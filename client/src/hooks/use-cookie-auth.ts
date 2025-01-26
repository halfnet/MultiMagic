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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const user = await response.json();
      document.cookie = `${COOKIE_NAME}=${username}; path=/; max-age=31536000`; // 1 year
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      toast({
        title: 'Welcome!',
        description: `Logged in as ${user.username}`,
      });
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
    isLoginLoading: loginMutation.isPending
  };
}
