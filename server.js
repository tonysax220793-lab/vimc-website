// Server tĩnh đơn giản cho website VIMC — không cần cài thêm package.
// Chạy: node server.js   (hoặc: npm start)
// Mặc định cổng 3001 (vì 3000 đã dùng). Đổi cổng: PORT=8080 node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    // Nếu không có đuôi file -> thử thêm .html
    if (!path.extname(urlPath)) urlPath += '.html';

    let filePath = path.join(ROOT, urlPath);

    // Chặn path traversal
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); res.end('403 Forbidden'); return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // fallback 404
        fs.readFile(path.join(ROOT, '404.html'), (e2, page404) => {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(e2 ? '404 Not Found' : page404);
        });
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500); res.end('500 Server Error');
  }
});

server.listen(PORT, () => {
  console.log('\n  VIMC website đang chạy tại:  http://localhost:' + PORT + '\n');
  console.log('  Dừng server: Ctrl + C\n');
});
