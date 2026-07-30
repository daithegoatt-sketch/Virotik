import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT) || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Resource-Policy': 'same-site'
};

function send(res, statusCode, body, contentType, extraHeaders = {}) {
  res.writeHead(statusCode, {
    ...securityHeaders,
    'Content-Type': contentType,
    'Cache-Control': process.env.NODE_ENV === 'production' ? 'public, max-age=3600' : 'no-cache',
    ...extraHeaders
  });
  res.end(body);
}

async function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }

  const requested = decoded === '/' ? '/index.html' : decoded;
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
  const absolutePath = path.join(publicDir, safePath);
  if (!absolutePath.startsWith(publicDir)) return null;

  try {
    const fileStat = await stat(absolutePath);
    if (fileStat.isFile()) return absolutePath;
  } catch {
    return null;
  }
  return null;
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed', 'text/plain; charset=utf-8', { Allow: 'GET, HEAD' });
    return;
  }

  if (req.url === '/health') {
    send(res, 200, JSON.stringify({ status: 'ok', service: 'virotik-studio' }), 'application/json; charset=utf-8', { 'Cache-Control': 'no-store' });
    return;
  }

  let filePath = await resolveFile(req.url || '/');
  if (!filePath && !path.extname((req.url || '').split('?')[0])) {
    filePath = path.join(publicDir, 'index.html');
  }

  if (!filePath) {
    send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    send(res, 200, req.method === 'HEAD' ? '' : body, contentType);
  } catch {
    send(res, 500, 'Internal Server Error', 'text/plain; charset=utf-8');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`ViroTik Studio running on port ${port}`);
});
