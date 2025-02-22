import type { Express } from 'express';
import { createServer, type Server } from 'http';
import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

// Import route modules
import userRoutes from './routes/user';
import mathGameRoutes from './routes/math-game';
import amcGameRoutes from './routes/amc-game';
import apiDocsRoutes from './routes/api-docs';

export function registerRoutes(app: Express): Server {
  // Middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    csrf({
      cookie: {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
      },
    })
  );

  // CORS configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, CSRF-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // CSRF token route
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

  // Register route modules
  app.use('/api', userRoutes);
  app.use('/api', mathGameRoutes);
  app.use('/api', amcGameRoutes);
  app.use('/api', apiDocsRoutes);

  const httpServer = createServer(app);
  return httpServer;
}