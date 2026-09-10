import { createErrorResponder } from './failures.js';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes, type ApiDependencies } from './routes.js';

/** Compose the application without opening sockets or loading credentials. Example: createApi(fakeDependencies). */
export function createApi(dependencies: ApiDependencies, app: Express = express()): Express {
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({ origin: dependencies.origins, allowedHeaders: ['Content-Type', 'Authorization'] }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.get('/health', (_request, response) =>
    response.json({ status: 'ok', service: 'recall-api' }),
  );
  app.use('/v1', createRoutes(dependencies));
  app.use((_request, response) => response.status(404).json({ error: 'Route not found.' }));
  app.use(createErrorResponder(dependencies.logger));
  return app;
}
