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

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // join room event
  socket.on('join playground', (room) => {
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
