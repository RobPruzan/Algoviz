import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
export type SocketAction = { type: string; payload: any };
type Data =
  | { roomID: string; type: 'circleReciever'; state: any; senderID: string }
  | { roomID: string; type: 'edge'; state: any; senderID: string };
io.on('connect', (socket) => {
  console.log('a user connected');

  // join room event
  socket.on('join playground', (roomID: string) => {
    console.log('User joined playground ' + roomID);
    socket.join(roomID);
  });

  // chat message event within rooms
  socket.on('update', (data: Data) => {
    // event comes in (like an event handler) you emit the event to the entire room
    // console.log('state update', data.state);
    console.log('state update', data.roomID);
    io.to(data.roomID).emit('update', data);
  });

  socket.on('action', (data: SocketAction) => {
    // event comes in (like an event handler) you emit the event to the entire room
    // console.log('state update', data.state);
    console.log('state update', data.roomID);
    io.to(data.roomID).emit('update', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
