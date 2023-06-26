"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
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
// type Data =
//   | { roomID: string; type: 'circleReciever'; state: any; senderID: string }
//   | { roomID: string; type: 'edge'; state: any; senderID: string };
io.on('connect', (socket) => {
    console.log('a user connected', new Date().getTime());
    // join room event
    socket.on('join playground', (roomID) => {
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
    socket.on('action', (data) => {
        // event comes in (like an event handler) you emit the event to the entire room
        // console.log('state update', data.state);
        // console.log('incoming data', data);
        console.log(`receiving action, playgroundID:${data.meta.playgroundID}`, new Date().getTime());
        data.meta.fromServer = true;
        io.to(data.meta.playgroundID).emit('action', data);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected', new Date().getTime());
    });
});
const port = 8080;
server.listen(port, () => {
    console.log(`listening on *:${port}`, new Date().getTime());
});
//# sourceMappingURL=server.js.map