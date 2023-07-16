import { useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

// type IO = ReturnType<typeof io>;
// const useCanvasSocket = () => {
//   const socketRef = useRef<IO>();
//   const searchParams = useSearchParams();
//   const playgroundId = searchParams.get('playground-id');

//   useEffect(() => {
//     socketRef.current = io(process.env.SOCKET_SERVER_URL);

//     // socketRef.current.on('chat message', (message) => {

//     //   setMessages((messages) => [...messages, JSON.stringify(message)]);
//     // });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   const joinRoom = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     socketRef.current?.emit('join playground', playgroundId);
//   };
// };
