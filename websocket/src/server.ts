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
let mainId = '';
// type Data =
//   | { roomID: string; type: 'circleReciever'; state: any; senderID: string }
//   | { roomID: string; type: 'edge'; state: any; senderID: string };
io.on('connect', (socket) => {
  console.log('a user connected (+1)', new Date().getUTCDay());

  // join room event
  socket.on('join playground', (roomID: string) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(roomID);
    // console.log('Current users in the room:', Array.from(clientsInRoom ?? []));
    console.log('User joined playground ' + roomID, clientsInRoom);
    mainId = roomID;
    playgroundUsers.set(roomID, (playgroundUsers.get(roomID) ?? 0) + 1);
    console.log('users', playgroundUsers);

    // need to send in the userid for debuggin
    // playgroundUsers.set(roomID, )
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
    // console.log(
    //   `receiving action, playgroundID:${data.meta.playgroundID}`,
    //   new Date().getTime()
    // );
    // the problem is an action is being emitted to a room, but only one person is in the room
    // sometimes a user connects
    // console.log('fsfds');
    const clientsInRoom = io.sockets.adapter.rooms.get(data.meta.playgroundID);
    console.log('Current users in the room:', Array.from(clientsInRoom ?? []));
    data.meta.fromServer = true;
    // console.log('ufsd');
    // socket bug is when simply creating a link and someone joins, it's only one way. When resetting the server though it immediatly goes back to bidirectional. Need to debug this
    // also got a socket hangup error. There could be an issue with socket initialization. I could investigate that
    // could make sure im tracking on the server the people in the room with a map
    // io.in(data.meta.playgroundID).emit('action', data);
    // io.to(data.meta.playgroundID).emit('action', data);
    socket.broadcast.to(data.meta.playgroundID).emit('action', data);
  });

  socket.on('disconnect', () => {
    playgroundUsers.set(mainId, (playgroundUsers.get(mainId) ?? 0) - 1);
    console.log('users', playgroundUsers);

    console.log('user disconnected (-1)', new Date().getTime());
  });
});

const port = 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
