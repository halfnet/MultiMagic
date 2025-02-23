import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface TutorChatProps {
  problemId: number;
  currentQuestion: string;
  currentAnswer: string;
  currentSolution: string;
}

export function TutorChat({ problemId, currentQuestion, currentAnswer, currentSolution}: TutorChatProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetQuestions = [
    "What concept does this problem involve?",
    "Can you explain the first step?"
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
          currentAnswer,
          currentSolution,
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

  

  const renderMessageContent = (content: string) => {
    // Split on math expressions and LaTeX commands
    const parts = content.split(/(\$[^$]+\$|\\\([^)]+\\\)|\\\[[^\]]+\\\])/);

    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return <MathJax key={index}>{part}</MathJax>;
      } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
        return <MathJax key={index}>{part}</MathJax>;
      } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
        return <MathJax key={index} display>{part}</MathJax>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <MathJaxContext config={{
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
      }
    }}>
      <div className={`
        ${isFullScreen ? 'fixed inset-0 z-50' : 'fixed lg:static lg:w-full lg:rounded-lg lg:mt-6 md:bottom-0 md:right-4 md:w-96'}
        bg-white rounded-t-lg shadow-lg border border-gray-200
      `}>
        <div 
          className="p-3 border-b cursor-pointer flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="font-semibold">AI Math Tutor</h3>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFullScreen(!isFullScreen); }}
              className="hover:bg-gray-100 p-1 rounded"
            >
            {isFullScreen ? (
              // Exit Full-Screen Icon (Shrink)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 4h4m0 0v4m0-4l-5 5M8 20H4m0 0v-4m0 4l5-5M16 20h4m0 0v-4m0 4l-5-5M8 4H4m0 0v4m0-4l5 5" />
              </svg>
            ) : (
              // Enter Full-Screen Icon (Expand)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4h6m-6 0v6m0-6l6 6M20 20h-6m6 0v-6m0 6l-6-6M4 20h6m-6 0v-6m0 6l6-6M20 4h-6m6 0v6m0-6l-6 6" />
              </svg>
            )}
            </button>
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4">
            <div className="space-y-2 mb-4">
              {presetQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="mr-2 text-sm font-normal"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                >
                  {q}
                </Button>
              ))}
            </div>

            <div className={`${isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-48'} overflow-y-auto mb-2 space-y-3`}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}