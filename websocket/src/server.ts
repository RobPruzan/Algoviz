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

const playgroundUsers = new Map<string, number>();
// let mainId = '';

io.on('connect', (socket) => {
  console.log('a user connected (+1)', new Date().getUTCDay());

  // join room event
  socket.on('join playground', (roomID: string) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(roomID);
    console.log('User joined playground ' + roomID, clientsInRoom);
    // mainId = roomID;
    playgroundUsers.set(roomID, (playgroundUsers.get(roomID) ?? 0) + 1);
    console.log('users', playgroundUsers);
    socket.join(roomID);
  });

  socket.on('action', (data: SocketAction) => {
    // const clientsInRoom = io.sockets.adapter.rooms.get(data.meta.playgroundID);
    // console.log('Current users in the room:', Array.from(clientsInRoom ?? []));
    data.meta.fromServer = true;
    socket.broadcast.to(data.meta.playgroundID).emit('action', data);
  });

  socket.on('disconnect', () => {
    // playgroundUsers.set(mainId, (playgroundUsers.get(mainId) ?? 0) - 1);
    console.log('users', playgroundUsers);

    console.log('user disconnected (-1)', new Date().getTime());
  });
});

const port = 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
