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

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const playgroundUsers = new Map<string, (User | { id: string })[]>();
// let mainId = '';

io.on('connect', (socket) => {
  console.log('a user connected (+1)', new Date().getUTCDay());

  // join room event
  socket.on('join playground', (playgroundID: string, user: User) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(playgroundID);
    console.log('User joined playground ' + playgroundID, clientsInRoom);
    // mainId = roomID;
    playgroundUsers.set(
      playgroundID,
      // (playgroundUsers.get(playgroundID) ?? 0) + 1
      [...playgroundUsers.get(playgroundID), user]
    );
    console.log('users', playgroundUsers);
    socket.join(playgroundID);
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

  socket.on('get connected users', (playgroundID: string, acknowledgement) => {
    const usersInPlayground = playgroundUsers.get(playgroundID);
    console.log('usersInPlayground', usersInPlayground);

    acknowledgement(usersInPlayground);
  });
});

const port = 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
