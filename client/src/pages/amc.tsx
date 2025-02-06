
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

interface Problem {
  id: number;
  year: number;
  competition_type: string;
  problem_number: number;
  question_html: string;
}

export default function AMC() {
  const [_, setLocation] = useLocation();
  const [showProblem, setShowProblem] = useState(false);
  
  const { data: problem, refetch } = useQuery<Problem>({
    queryKey: ['random-amc8-problem'],
    queryFn: async () => {
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();
      
      const response = await fetch('/api/problems/random/amc8', {
        headers: {
          'CSRF-Token': csrfToken
        }
      });
      return response.json();
    },
    enabled: showProblem
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">AMC Problems</h1>
          <Button
            onClick={() => setLocation('/')}
            className="bg-primary/90 hover:bg-primary text-primary-foreground"
          >
            Back to Game
          </Button>
        </div>
        
        {!showProblem ? (
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => {
                refetch();
                setShowProblem(true);
              }}
            >
              AMC 8
            </Button>
            <Button size="lg" disabled>
              AMC 10 (Coming Soon)
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: problem?.question_html || '' }}
            />
            <div className="flex justify-between">
              <Button onClick={() => setShowProblem(false)}>
                Back to Selection
              </Button>
              <Button onClick={() => setShowProblem(true)}>
                Next Problem
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
