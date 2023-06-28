'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const socket_io_1 = require('socket.io');
const cors_1 = __importDefault(require('cors'));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = require('http').createServer(app);
const io = new socket_io_1.Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const playgroundUsers = new Map();
let mainId = '';
// type Data =
//   | { roomID: string; type: 'circleReciever'; state: any; senderID: string }
//   | { roomID: string; type: 'edge'; state: any; senderID: string };
io.on('connect', (socket) => {
  console.log('a user connected', new Date().getTime());
  // join room event
  socket.on('join playground', (roomID) => {
    var _a;
    console.log('User joined playground ' + roomID, new Date().getTime());
    mainId = roomID;
    playgroundUsers.set(
      roomID,
      ((_a = playgroundUsers.get(roomID)) !== null && _a !== void 0 ? _a : 0) +
        1
    );
    console.log('users', playgroundUsers);
    // need to send in the userid for debuggin
    // playgroundUsers.set(roomID, )
    console.log('fdsf');
    socket.join(roomID);
  });
  // chat message event within rooms
  // socket.on('update', (data: SocketAction) => {
  //   // event comes in (like an event handler) you emit the event to the entire room
  //   // console.log('state update', data.state);
  //   console.log('state update', data.meta.playgroundID);
  //   io.to(data.meta.playgroundID).emit('update', data);
  // });
  socket.on('action', (data) => {
    // event comes in (like an event handler) you emit the event to the entire room
    // console.log('state update', data.state);
    // console.log('incoming data', data);
    // console.log(
    //   `receiving action, playgroundID:${data.meta.playgroundID}`,
    //   new Date().getTime()
    // );
    // the problem is an action is being emitted to a room, but only one person is in the room
    // sometimes a user connects
    data.meta.fromServer = true;
    // socket bug is when simply creating a link and someone joins, it's only one way. When resetting the server though it immediatly goes back to bidirectional. Need to debug this
    // also got a socket hangup error. There could be an issue with socket initialization. I could investigate that
    // could make sure im tracking on the server the people in the room with a map
    // io.in(data.meta.playgroundID).emit('action', data);
    // io.to(data.meta.playgroundID).emit('action', data);
  });
  socket.on('disconnect', () => {
    var _a;
    playgroundUsers.set(
      mainId,
      ((_a = playgroundUsers.get(mainId)) !== null && _a !== void 0 ? _a : 0) -
        1
    );
    console.log('users', playgroundUsers);
    console.log('user disconnected', new Date().getTime());
  });
});
const port = 8080;
server.listen(port, () => {
  console.log(`listening on *:${port}`, new Date().getTime());
});
//# sourceMappingURL=server.js.map
