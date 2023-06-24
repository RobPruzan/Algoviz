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
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
io.on('connection', (socket) => {
    console.log('a user connected');
    // join room event
    socket.on('join room', (room) => {
        console.log('User joined room ' + room);
        socket.join(room);
    });
    // chat message event within rooms
    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', data.msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
const port = 8080;
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
//# sourceMappingURL=server.js.map