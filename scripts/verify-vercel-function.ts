import 'dotenv/config';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer, type RequestListener } from 'node:http';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

interface FunctionConfiguration {
  handler: string;
}

/** Exercise Vercel's emitted files with native Node resolution. Example: verify-vercel-function.ts apps/mcp/.vercel/output/functions/index.func. */
async function verifyFunctionBundle(bundleDirectory: string): Promise<void> {
  const application = await readFunctionApplication(bundleDirectory);
  const server = createServer(application).listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const address = server.address();
    assert(address && typeof address === 'object', 'Expected a local HTTP listener');
    await verifyHttpBoundaries(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((complete, reject) =>
      server.close((error) => (error ? reject(error) : complete())),
    );
  }
}

async function readFunctionApplication(bundleDirectory: string): Promise<RequestListener> {
  const configuration = JSON.parse(
    await readFile(resolve(bundleDirectory, '.vc-config.json'), 'utf8'),
  ) as FunctionConfiguration;
  const entryPath = resolve(bundleDirectory, configuration.handler);
  assert(
    !relative(bundleDirectory, entryPath).startsWith('..'),
    'Expected an entrypoint inside the function bundle',
  );
  const application = (await import(pathToFileURL(entryPath).href)) as { default: RequestListener };
  return application.default;
}

async function verifyHttpBoundaries(origin: string): Promise<void> {
  const response = await fetch(`${origin}/health`);
  assert.equal(response.status, 200);
  const health = (await response.json()) as { status: string; service: string };
  assert.equal(health.status, 'ok');
  const isMcp = health.service === 'recall-mcp';
  const denied = await fetch(`${origin}${isMcp ? '/mcp' : '/v1/cards'}`, {
    method: isMcp ? 'POST' : 'GET',
  });
  assert.equal(denied.status, 401);
  process.stdout.write(
    JSON.stringify({ service: health.service, bundle: 'passed', anonymousAccess: 'denied' }) + '\n',
  );
}

const bundleDirectory = process.argv[2];
if (!bundleDirectory)
  throw new Error('Invalid bundle path undefined; expected a Vercel .func directory');
await verifyFunctionBundle(resolve(bundleDirectory));
