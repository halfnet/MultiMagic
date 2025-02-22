import type { Express } from 'express';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

export function setupMiddleware(app: Express): void {
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
}