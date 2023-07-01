'use client';

import { io } from 'socket.io-client';
import { CircleReceiver, Edge, IO, SocketAction, UntypedData } from '../types';
import { useAppDispatch } from '@/redux/store';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';
type SecondParam<T> = T extends (arg1: any, arg2: infer P) => any ? P : T;
type OnCB = SecondParam<ReturnType<typeof io>['on']>;

export class SocketIO {
  socket: IO | null;

  constructor(url: string) {
    if (typeof window !== 'undefined') {
      console.log('client');
      this.socket = io(url);
    } else {
      console.log('servercode');

      this.socket = null;
    }
  }

  sendUpdate(
    state:
      | {
          roomID: string;
          type: 'circleReciever';
          state: CircleReceiver;
          senderID: string;
        }
      | { roomID: string; type: 'edge'; state: Edge; senderID: string }
  ) {
    this.socket?.emit('update', state);
  }

  sendSocketAction(action: SocketAction & { meta: Meta | undefined }) {
    this.socket?.emit('action', action);
  }

  sendCreate(
    state:
      | { roomID: string; type: 'circleReciever'; state: CircleReceiver }
      | { roomID: string; type: 'edge'; state: Edge }
  ) {
    this.socket?.emit('create', state);
  }

  joinPlayground(playgroundID: string) {
    console.log('is the user emitting a join playground request', playgroundID);
    this.socket?.emit('join playground', playgroundID);
  }
  // connect(playgroundID: string) {
  //   console.log(
  //     'inside connect, and socket res is',
  //     this.socket,
  //     !!this.socket
  //   );
  //   // this.socket?.on('connect', () => {
  //   //   console.log('bout to join da playground');
  //   //   this.joinPlayground(playgroundID);
  //   // });
  //   this.joinPlayground(playgroundID);

  //   // this.socket?.emit('connect');
  // }

  addActionListener(cb: OnCB) {
    this.socket?.on('action', cb);
  }
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
  handelUpdate(userID: string, dispatch: ReturnType<typeof useAppDispatch>) {
    this.socket?.on('update', (data: UntypedData) => {
      switch (data.type) {
        case 'circleReciever':
          if (data.senderID !== userID) {
            console.log('dispatching update');
            dispatch(CanvasActions.replaceCircle(data.state));
          }
        case 'edge':
          dispatch(CanvasActions.replaceAttachableLine(data.state));
      }
      // dispatch
    });
  }

  handleCreate(userID: string, dispatch: ReturnType<typeof useAppDispatch>) {
    this.socket?.on('create', (data: UntypedData) => {
      switch (data.type) {
        case 'circleReciever':
          if (data.senderID !== userID) {
            // console.log('dispatching update');
            dispatch(CanvasActions.addCircle(data.state));
          }
        case 'edge':
          dispatch(CanvasActions.addLine(data.state));
      }
    });
    // dispatch
  }
}

// #TODO make this an env var
export const socket = new SocketIO('http://localhost:8080');
