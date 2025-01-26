import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCookieAuth } from '@/hooks/use-cookie-auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const { login, isLoginLoading } = useCookieAuth();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    await login(username);
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to Math Game</h1>
            <p className="text-muted-foreground">
              Enter your username to start playing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoginLoading || !username.trim()}
          >
            {isLoginLoading ? 'Loading...' : 'Start Playing'}
          </Button>
        </form>
      </Card>
    </div>
  );
}