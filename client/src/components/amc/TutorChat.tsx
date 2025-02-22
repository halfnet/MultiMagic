import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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

  const escapeLaTeX = (text: string) => {
    let result = text;

    // Handle currency notation ($X.XX)
    result = result.replace(/\$\d+(?:\.\d{2})?/g, (match) => {
      return `\\text{${match}}`;
    });

    // Handle LaTeX commands
    result = result.replace(/\\underline\{([^}]+)\}/g, (_, content) => {
      return `\\underline{\\text{${content}}}`;
    });

    // Handle newlines
    result = result.replace(/\n/g, '\\\\');

    return result;
  };

  const renderMessageContent = (content: string) => {
    // Split on math expressions while preserving currency
    const parts = content.split(/(\$(?!\d+(?:\.\d{2})?)[^$]+\$)/);

    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        // Render inline math, but only if it’s a valid math expression (not just numbers with $)
        const mathContent = part.slice(1, -1).trim();
        if (mathContent && !/^\d+\.?\d*$/.test(mathContent)) { // Skip numbers/decimals like "10" or "2.40"
          return <InlineMath key={index} math={escapeLaTeX(mathContent)} />;
        }
        return <span key={index}>{`$${mathContent}$`}</span>; // Render as plain text with $ symbols
      } else if (part.startsWith('\\') && part.includes('{')) {
        // Handle LaTeX commands like \underline{}
        try {
          return <InlineMath key={index} math={escapeLaTeX(part)} />;
        } catch (error) {
          console.warn('Failed to render LaTeX command:', part, error);
          return <span key={index}>{part}</span>; // Fallback to plain text
        }
      } else if (part === '\\\\') {
        return <br key={index} />;
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className={`
      fixed lg:static lg:w-full lg:rounded-lg lg:mt-6
      md:bottom-0 md:right-4 md:w-96 
      bg-white rounded-t-lg shadow-lg border border-gray-200
    `}>
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
                className="mr-2 text-sm font-normal"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
              >
                {q}
              </Button>
            ))}
          </div>

          <div className="h-48 overflow-y-auto mb-2 space-y-3">
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
  );
}