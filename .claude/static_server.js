// Tiny static server for the freedom-home harness walks (pattern copied from
// dave_funnel_engine/.claude/static_server.js — python http.server is blocked
// from Desktop by macOS TCC; node is not).
//
// ROOT is the PARENT of this repo (coding_projects): test_home.html loads the
// real widget from ../ai_tools/widget/, so serving only the repo root would
// 404 the widget and every tool state would silently vanish from the walk.
// Browser pane refuses file:// URLs, so a walk always needs this server:
//   http://localhost:4383/freedom-tracker/test_home.html?s=day1_fresh
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.PORT) || 4383;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};
http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let fp = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
    if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if (fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, () => console.log('fh harness server on http://localhost:' + PORT + '/'));
