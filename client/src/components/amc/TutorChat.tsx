
import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

export function TutorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);
  const [inputText, setInputText] = useState('');

  const presetQuestions = [
    "What concept does this problem involve?",
    "Can you explain the first step?",
    "I'm stuck on..."
  ];

  const sendMessage = (text: string) => {
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    // TODO: Implement AI response handling
    setInputText('');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full mb-2">
          {isOpen ? 'Close AI Tutor' : 'Open AI Tutor'}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <div className="h-[300px] overflow-y-auto border rounded p-4 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`${msg.sender === 'ai' ? 'bg-gray-100' : 'bg-blue-100'} p-2 rounded`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {presetQuestions.map((q, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm"
              onClick={() => sendMessage(q)}
            >
              {q}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your question..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
          />
          <Button onClick={() => sendMessage(inputText)}>Send</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
