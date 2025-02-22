import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from '../swagger';

export function registerDocsRoutes(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}