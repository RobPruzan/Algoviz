import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
type Meta = {
  userID: string;
  playgroundID: string;
  fromServer?: boolean;
  scaleFactor?: number;
};
type SocketAction = { type: string; payload: any } & { meta: Meta | undefined };

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
// should code split to get the type from next
type ObjectState = {
  circles: any;
  attachableLines: any;
  validatorLensContainer: any;
  pencilCoordinates: any;
};

const playgroundUsers = new Map<string, (User | { id: string })[]>();
// let mainId = '';

io.on('connect', (socket) => {
  console.log('a user connected (+1)', new Date().getUTCDay());

  // join room event
  socket.on(
    'join playground',

    (playgroundID: string, user: User, acknowledgement) => {
      // mainId = roomID;
      const before_UsersInPlayground = playgroundUsers.get(playgroundID);

      if (before_UsersInPlayground?.some((u) => u.id === user.id)) {
        return;
      }

      playgroundUsers.set(
        playgroundID,
        // (playgroundUsers.get(playgroundID) ?? 0) + 1
        [...(before_UsersInPlayground ?? []), user]
      );

      socket.join(playgroundID);
      const after_UsersInPlayground = playgroundUsers.get(playgroundID);
      // console.log('calling ack with users: ', after_UsersInPlayground);

      acknowledgement(after_UsersInPlayground);
      socket.emit('user joined playground', user);
    }
  );

  socket.on('action', (data: SocketAction) => {
    // const clientsInRoom = io.sockets.adapter.rooms.get(data.meta.playgroundID);
    // console.log('Current users in the room:', Array.from(clientsInRoom ?? []));
    data.meta.fromServer = true;
    // kinda confused to have action as 2 separate handlers should change
    socket.broadcast.to(data.meta.playgroundID).emit('action', data);
  });

  socket.on('disconnect', () => {
    // playgroundUsers.set(mainId, (playgroundUsers.get(mainId) ?? 0) - 1);

    console.log('user disconnected (-1)', new Date().getTime());
  });

  socket.on(
    'synchronize',
    (
      state: ObjectState,
      cameraCoordinate: [number, number],
      zoomFactor: number,
      playgroundID: string
    ) => {
      socket.broadcast
        .to(playgroundID)
        .emit('synchronize', state, cameraCoordinate, zoomFactor);
    }
  );

  socket.on('get connected users', (playgroundID: string, acknowledgement) => {
    const usersInPlayground = playgroundUsers.get(playgroundID);

    acknowledgement(usersInPlayground);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
