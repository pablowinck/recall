import app from './server.js';

const port = Number(process.env.PORT ?? 3211);
app.listen(port, '0.0.0.0', () => {
  process.stdout.write(JSON.stringify({ event: 'api_listening', port }) + '\n');
});
