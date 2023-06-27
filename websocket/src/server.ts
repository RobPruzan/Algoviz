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
type Meta = { userID: string; playgroundID: string; fromServer?: boolean };
type SocketAction = { type: string; payload: any } & { meta: Meta | undefined };
// type Data =
//   | { roomID: string; type: 'circleReciever'; state: any; senderID: string }
//   | { roomID: string; type: 'edge'; state: any; senderID: string };
io.on('connect', (socket) => {
  console.log('a user connected', new Date().getTime());

  // join room event
  socket.on('join playground', (roomID: string) => {
    console.log('User joined playground ' + roomID, new Date().getTime());
    socket.join(roomID);
  });

  // chat message event within rooms
  // socket.on('update', (data: SocketAction) => {
  //   // event comes in (like an event handler) you emit the event to the entire room
  //   // console.log('state update', data.state);
  //   console.log('state update', data.meta.playgroundID);
  //   io.to(data.meta.playgroundID).emit('update', data);
  // });

  socket.on('action', (data: SocketAction) => {
    // event comes in (like an event handler) you emit the event to the entire room
    // console.log('state update', data.state);

    // console.log('incoming data', data);
    console.log(
      `receiving action, playgroundID:${data.meta.playgroundID}`,
      new Date().getTime()
    );

    data.meta.fromServer = true;
    io.in(data.meta.playgroundID).emit('action', data);
    // io.to(data.meta.playgroundID).emit('action', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', new Date().getTime());
  });
});

const port = 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
