
import { Router } from 'express';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/users', async (req, res) => {
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

router.post('/login', async (req, res) => {
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

router.post('/user/theme', async (req, res) => {
  try {
    const { userId, themeColor } = req.body;
    await db.update(users).set({ themeColor }).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving theme color:', error);
    res.status(500).json({ error: 'Failed to save theme color' });
  }
});

export default router;
