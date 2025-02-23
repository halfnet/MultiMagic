
import type { Express } from 'express';
import { db } from '../../db';
import { amcTutorSession, amcTutorSessionInteractions } from '../../db/schema';
import { sql } from 'drizzle-orm';

export function registerTutorChatRoutes(app: Express): void {
  let currentSession: { [key: string]: number } = {};

  app.post('/api/tutor-chat', async (req, res) => {
    try {
      const { messages, problemId, currentQuestion, answer, solution_html, userId } = req.body;
      const userKey = `${userId}-${problemId}`;

      // Start new session if this is the first message
      if (!currentSession[userKey] && messages.length === 1) {
        const [session] = await db
          .insert(amcTutorSession)
          .values({
            userId,
            problemId,
            startedAt: sql`CURRENT_TIMESTAMP`,
          })
          .returning();
        currentSession[userKey] = session.sessionId;
      }

      let systemContext = `You are a helpful math tutor assisting with AMC math problems. 
      Your role is to guide students through mathematical reasoning without giving away solutions.
      Use Socratic questioning to help students discover answers themselves.
      Format mathematical expressions using LaTeX notation.
      Never provide direct answers or solutions.
      Focus on explaining concepts and problem-solving strategies.`;

      if (answer) {
        systemContext += `\nThe correct answer is: ${answer}`;
      }
      if (solution_html) {
        systemContext += `\nThe solution approach is: ${solution_html}`;
      }

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
              content: systemContext,
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
      const tutorResponse = data.choices[0].message.content;

      // Record the interaction if session exists
      if (currentSession[userKey]) {
        await db
          .insert(amcTutorSessionInteractions)
          .values({
            sessionId: currentSession[userKey],
            userQuestion: messages[messages.length - 1].content,
            tutorResponse,
            questionCreatedAt: sql`CURRENT_TIMESTAMP`,
            responseCreatedAt: sql`CURRENT_TIMESTAMP`,
          });
      }

      res.json({ response: tutorResponse });
    } catch (error) {
      console.error('Error in tutor chat:', error);
      res.status(500).json({ error: 'Failed to process chat' });
    }
  });

  app.post('/api/tutor-chat/end-session', async (req, res) => {
    try {
      const { userId, problemId } = req.body;
      const userKey = `${userId}-${problemId}`;
      const sessionId = currentSession[userKey];
      
      if (sessionId) {
        await db
          .update(amcTutorSession)
          .set({
            endedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(sql`session_id = ${sessionId}`);
        
        delete currentSession[userKey];
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error ending tutor session:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  });
}
