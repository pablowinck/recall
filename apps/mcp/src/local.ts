import app from './server';

const port = Number(process.env.PORT ?? 3212);
app.listen(port, '0.0.0.0', () => {
  process.stdout.write(JSON.stringify({ event: 'mcp_listening', port }) + '\n');
});
