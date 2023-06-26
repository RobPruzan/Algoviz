'use client';

import { io } from 'socket.io-client';
import { CircleReceiver, Edge, IO, SocketAction, UntypedData } from '../types';
import { useAppDispatch } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
type SecondParam<T> = T extends (arg1: any, arg2: infer P) => any ? P : T;
type OnCB = SecondParam<ReturnType<typeof io>['on']>;

export class SocketIO {
  socket: IO | null;

  constructor(url: string) {
    this.socket = io(url);
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

  sendSocketAction(action: SocketAction) {
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
    this.socket?.emit('join playground', playgroundID);
  }
  connect(playgroundID: string) {
    this.socket?.on('connect', () => {
      this.joinPlayground(playgroundID);
    });
  }

  updateListener(cb: OnCB) {
    this.socket?.on('update', cb);
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
            // console.log('dispatching update');
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
console.log('hjello');
