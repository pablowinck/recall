import express, { type ErrorRequestHandler, type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { RecallError } from '../errors';
import { createRoutes, type ApiDependencies } from './routes';

/** Monta o app sem abrir sockets nem carregar credenciais. Exemplo: createApi(fakeDependencies). */
export function createApi(dependencies: ApiDependencies): Express {
  const app = express();
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
  app.use((_request, response) => response.status(404).json({ error: 'Rota não encontrada.' }));
  app.use(apiErrorResponse);
  return app;
}

const apiErrorResponse: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof RecallError) {
    response.status(error.status).json({ error: error.message });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'Confira os campos informados.',
      fields: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    });
    return;
  }
  const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
  if (code === '23505') {
    response.status(409).json({ error: 'Este registro já existe. Atualize para continuar.' });
    return;
  }
  if (code === '23503' || code === '42501') {
    response.status(400).json({ error: 'Baralho ou registro indisponível no seu espaço.' });
    return;
  }
  process.stderr.write(
    JSON.stringify({
      level: 'error',
      event: 'api_request_failed',
      code: code ?? 'unknown',
      message: error instanceof Error ? error.message : 'unknown',
    }) + '\n',
  );
  response.status(500).json({ error: 'Não foi possível concluir. Tente novamente.' });
};
