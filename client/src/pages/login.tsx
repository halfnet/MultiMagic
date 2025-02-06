import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCookieAuth } from '@/hooks/use-cookie-auth';
import { useQuery } from '@tanstack/react-query';
import type { SelectUser } from '@db/schema';

export default function Login() {
  const [username, setUsername] = useState('');
  const [showNewUser, setShowNewUser] = useState(false);
  const { login, isLoginLoading } = useCookieAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<SelectUser[]>({
    queryKey: ['/api/users'],
  });

  const handleLogin = async (username: string) => {
    if (!username.trim()) return;

    try {
      await login(username);
      setLocation('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to Math Game</h1>
            <p className="text-muted-foreground">
              {showNewUser ? 'Create a new user' : 'Select existing or create new user'}
            </p>
          </div>

          {!showNewUser ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Existing User</Label>
                <Select
                  disabled={isLoadingUsers}
                  onValueChange={value => {
                    if (value) {
                      handleLogin(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.username}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowNewUser(true)}
              >
                Create New User
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">New Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  minLength={2}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoginLoading || !username.trim()}
                >
                  {isLoginLoading ? 'Creating...' : 'Create & Start'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewUser(false);
                    setUsername('');
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
