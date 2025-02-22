
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import MathJax from 'react-mathjax';

interface TutorChatProps {
  problemId: number;
  currentQuestion: string;
}

export function TutorChat({ problemId, currentQuestion }: TutorChatProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetQuestions = [
    "What concept does this problem involve?",
    "Can you explain the first step?",
    "I'm stuck on..."
  ];

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': await getCsrfToken(),
        },
        body: JSON.stringify({
          messages: newMessages,
          problemId,
          currentQuestion,
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCsrfToken = async () => {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.csrfToken;
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 bg-white rounded-t-lg shadow-lg border border-gray-200">
      <div 
        className="p-3 border-b cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold">AI Math Tutor</h3>
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="space-y-2 mb-4">
            {presetQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                className="mr-2"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
              >
                {q}
              </Button>
            ))}
          </div>

          <div className="h-64 overflow-y-auto mb-4 space-y-4">
            <MathJax.Provider>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                  }`}
                >
                  <MathJax.Node formula={msg.content} />
                </div>
              ))}
            </MathJax.Provider>
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
