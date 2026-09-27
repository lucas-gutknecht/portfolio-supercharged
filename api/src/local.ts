import { createServer } from 'node:http';
import { route } from './router.js';

try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch {
  // No .env file — defaults apply and email runs in dry-run mode.
}

const port = Number(process.env.PORT ?? 3000);

createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length ? Buffer.concat(chunks).toString('utf8') : null;
  const path = new URL(req.url ?? '/', 'http://localhost').pathname;

  const result = await route({ method: req.method ?? 'GET', path, body });
  console.log(`${req.method} ${path} -> ${result.statusCode}`);

  res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result.body));
}).listen(port, () => {
  console.log(`Portfolio API listening on http://localhost:${port}`);
});
