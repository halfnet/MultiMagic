import type { Express } from 'express';

export function registerTutorChatRoutes(app: Express): void {
  app.post('/api/tutor-chat', async (req, res) => {
    try {
      const { messages, problemId, currentQuestion } = req.body;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a helpful math tutor assisting with AMC math problems. 
              Your role is to guide students through mathematical reasoning without giving away solutions.
              Use Socratic questioning to help students discover answers themselves.
              Format mathematical expressions using LaTeX notation.
              Never provide direct answers or solutions.
              Focus on explaining concepts and problem-solving strategies.`,
            },
            {
              role: 'system',
              content: `Current problem: ${currentQuestion}`,
            },
            ...messages,
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      res.json({ response: data.choices[0].message.content });
    } catch (error) {
      console.error('Error in tutor chat:', error);
      res.status(500).json({ error: 'Failed to process chat' });
    }
  });
}