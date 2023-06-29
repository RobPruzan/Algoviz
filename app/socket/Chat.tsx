'use client';
import React, { useEffect, useState } from 'react';

const Chat: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    let websocket = new WebSocket('ws://localhost:9001');
    console.log('web socket', websocket);
    websocket.onopen = () => console.log('WebSocket is connected.');
    websocket.onmessage = (ev) => {
      setMessages((messages) => [...messages, ev.data]);
    };
    websocket.onerror = (ev) =>
      console.log('WebSocket encountered error: ', ev);
    websocket.onclose = () => console.log('WebSocket is closed now.');

    setWs(websocket);
    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(input);
      setInput('');
    }
  };

  return (
    <div className="App">
      <form onSubmit={sendMessage}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.map((message, idx) => (
          <li key={idx}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
