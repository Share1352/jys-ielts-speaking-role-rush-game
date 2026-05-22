import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import type { PublicRoomState } from '@jys/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

const demoState: PublicRoomState = {
  roomCode: 'DEMO01',
  players: [],
  round: null
};

io.on('connection', (socket) => {
  socket.emit('room:public_state', demoState);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
