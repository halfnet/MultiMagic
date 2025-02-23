import type { Express } from 'express';
import { registerUserRoutes } from './userRoutes';
import { registerGameRoutes } from './gameRoutes';
import { registerAMCRoutes } from './amcRoutes';
import { registerTutorChatRoutes } from './tutorChatRoutes';
import { registerDocsRoutes } from './docsRoutes';

export function registerRoutes(app: Express): void {
  registerUserRoutes(app);
  registerGameRoutes(app);
  registerAMCRoutes(app);
  registerTutorChatRoutes(app);
  registerDocsRoutes(app);
}