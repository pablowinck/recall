import { ZodError } from 'zod';
import type { ErrorRequestHandler } from 'express';
import { RecallError } from '../errors.js';

export interface ApiLogger {
  error(record: { event: string; status: number; code: string }): void;
}
interface ApiFailure {
  status: number;
  error: string;
  code?: string;
  fields?: { path: PropertyKey[]; message: string }[];
}
interface IdentifiedError extends Error {
  code?: string;
  type?: string;
}

const parserFailures: Record<string, ApiFailure> = {
  'entity.parse.failed': { status: 400, error: 'Invalid JSON body. Expected a valid JSON object.' },
  'entity.too.large': { status: 413, error: 'Request body is too large. Maximum size is 1 MB.' },
  'encoding.unsupported': { status: 415, error: 'Unsupported body encoding. Use UTF-8 JSON.' },
  'charset.unsupported': { status: 415, error: 'Unsupported body encoding. Use UTF-8 JSON.' },
};
const databaseFailures: Record<string, ApiFailure> = {
  '23505': { status: 409, error: 'This record already exists. Refresh to continue.' },
  '23503': { status: 400, error: 'This deck or record is not available in your workspace.' },
  '42501': { status: 400, error: 'This deck or record is not available in your workspace.' },
};

/** Classify failures without exposing input or SQL. Example: classifyApiFailure(error). */
export function classifyApiFailure(error: unknown): ApiFailure {
  if (error instanceof RecallError) return { status: error.status, error: error.message };
  if (error instanceof ZodError)
    return {
      status: 400,
      error: 'Check the fields you entered.',
      fields: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    };
  const identified = error instanceof Error ? (error as IdentifiedError) : undefined;
  const known = parserFailures[identified?.type ?? ''] ?? databaseFailures[identified?.code ?? ''];
  return (
    known ?? {
      status: 500,
      error: 'Unable to complete the request. Please try again.',
      code: identified?.code ?? 'unknown',
    }
  );
}

/** Return stable JSON errors and log only safe identifiers. Example: createErrorResponder(logger). */
export function createErrorResponder(logger: ApiLogger): ErrorRequestHandler {
  return (error: unknown, _request, response, _next): void => {
    const failure = classifyApiFailure(error);
    if (failure.status >= 500)
      logger.error({
        event: 'api_request_failed',
        status: failure.status,
        code: failure.code ?? 'unknown',
      });
    response.setHeader('Cache-Control', 'no-store');
    response
      .status(failure.status)
      .json({ error: failure.error, ...(failure.fields ? { fields: failure.fields } : {}) });
  };
}
