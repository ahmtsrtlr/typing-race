import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
export function createHttpServer() {
  const dist = resolve('dist');
  const mime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
  };
  return createServer(async (req, res) => {
    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'typing-race' }));
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end();
      return;
    }
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const path = resolve(dist, '.' + decodeURIComponent(url.pathname));
      if (path !== dist && !path.startsWith(dist + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let body: Buffer;
      let extension = extname(path);
      try {
        body = await readFile(path);
      } catch {
        if (extension) {
          res.writeHead(404);
          res.end();
          return;
        }
        body = await readFile(resolve(dist, 'index.html'));
        extension = '.html';
      }
      res.writeHead(200, {
        'Content-Type': mime[extension] ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(404);
      res.end('Önce npm run build komutunu çalıştır.');
    }
  });
}
