import type { Express } from 'express';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     description: Retrieves a CSRF token required for POST/PUT/DELETE requests
 *     responses:
 *       200:
 *         description: CSRF token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login or create user
 *     description: Logs in an existing user or creates a new one
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         themeColor:
 *           type: string
 *         lastLoginAt:
 *           type: string
 */

export function registerUserRoutes(app: Express): void {
  app.get('/api/csrf-token', (req, res) => {
    try {
      const token = req.csrfToken();
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.json({ csrfToken: token });
    } catch (error) {
      console.error('Error generating CSRF token:', error);
      res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          themeColor: users.themeColor,
        })
        .from(users)
        .orderBy(users.username);
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username || typeof username !== 'string' || username.length < 2) {
        return res.status(400).json({ error: 'Invalid username' });
      }

      let [user] = await db
        .select({
          id: users.id,
          username: users.username,
          themeColor: users.themeColor,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        [user] = await db
          .insert(users)
          .values({
            username,
            themeColor: '#7c3aed',
          })
          .returning({
            id: users.id,
            username: users.username,
            themeColor: users.themeColor,
          });
      }

      await db
        .update(users)
        .set({ lastLoginAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(users.id, user.id));

      res.json(user);
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Failed to process login' });
    }
  });

  app.post('/api/user/theme', async (req, res) => {
    try {
      const { userId, themeColor } = req.body;
      await db.update(users).set({ themeColor }).where(eq(users.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving theme color:', error);
      res.status(500).json({ error: 'Failed to save theme color' });
    }
  });
}