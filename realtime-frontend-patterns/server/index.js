import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set();

app.use(express.static(path.join(__dirname, '../public')));

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let counter = 0;
  const interval = setInterval(() => {
    counter += 1;
    res.write(`data: ${JSON.stringify({ type: 'sse', counter, at: new Date().toISOString() })}\n\n`);
  }, 2000);

  req.on('close', () => clearInterval(interval));
});

wss.on('connection', (socket) => {
  clients.add(socket);
  socket.send(JSON.stringify({ type: 'status', message: 'WebSocket connected' }));

  socket.on('message', (raw) => {
    const text = raw.toString();
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'echo', message: text, at: new Date().toISOString() }));
      }
    }
  });

  socket.on('close', () => clients.delete(socket));
});

setInterval(() => {
  const payload = JSON.stringify({
    type: 'broadcast',
    message: 'Server push',
    at: new Date().toISOString(),
  });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}, 3000);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Realtime demo ready at http://localhost:${port}`);
});
