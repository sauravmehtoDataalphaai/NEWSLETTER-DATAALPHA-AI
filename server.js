import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Lightweight static server for Render Web Service.
 * Sets correct Content-Type for CSS/JS/SVG so the browser does not
 * reject stylesheets as text/plain.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

function safeJoin(root, requestPath) {
  const cleaned = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const absolute = path.join(root, cleaned);
  if (!absolute.startsWith(root)) return null;
  return absolute;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0] || '/');
  const relative = urlPath === '/' ? '/index.html' : urlPath;
  let filePath = safeJoin(distDir, relative);

  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    // Missing file or directory → SPA fallback to index.html
    if (err || !stat.isFile()) {
      filePath = path.join(distDir, 'index.html');
    }
    sendFile(res, filePath);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`DATAALPHA AI static server listening on 0.0.0.0:${port}`);
});
