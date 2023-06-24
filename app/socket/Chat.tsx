'use client';

const SOCKET_SERVER_URL = 'http://localhost:8080';

type IO = ReturnType<typeof io>;
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<IO>();

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('chat message', (message) => {
      console.log('da massge');
      setMessages((messages) => [...messages, JSON.stringify(message)]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    socketRef.current?.emit('join room', room);
    setMessages([]);
  };

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    socketRef.current?.emit('chat message', { room, msg: message });
    setMessage('');
  };

  return (
    <div>
      <form onSubmit={joinRoom}>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter room..."
        />
        <button className="border border-white">Join Room</button>
      </form>
      {messages.map((message, i) => (
        <div key={i}>{message}</div>
      ))}
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button className="border border-white">Send</button>
      </form>
    </div>
  );
};

export default Chat;
