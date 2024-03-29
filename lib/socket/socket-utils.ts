// may need
import { io } from 'socket.io-client';
import { CircleReceiver, Edge, IO, SocketAction, UntypedData } from '../types';
import { useAppDispatch } from '@/redux/store';
import { CanvasActions, Meta, ObjectState } from '@/redux/slices/canvasSlice';
import { type User } from 'next-auth';

type SecondParam<T> = T extends (arg1: any, arg2: infer P) => any ? P : T;
type OnCB = SecondParam<ReturnType<typeof io>['on']>;

export class SocketIO {
  socket: IO | null;

  constructor(url: string) {
    this.socket = null;
  }

  getConnectedUsers(playgroundID: string) {
    return new Promise<(User | { id: string })[]>((resolve, reject) => {
      this.socket?.emit('get connected users', playgroundID, (users: []) => {
        resolve(users);
      });
    });
  }

  emitSynchronizeObjectState(
    state: ObjectState,
    cameraCoordinate: [number, number],
    zoomFactor: number,
    playgroundID: string
  ) {
    this.socket?.emit(
      'synchronize',
      state,
      cameraCoordinate,
      zoomFactor,
      playgroundID
    );
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

  joinPlayground(playgroundID: string, user: User | { id: string | null }) {
    // this.socket?.emit('join playground', playgroundID, user);
    return new Promise<(User | { id: string })[]>((resolve, reject) => {
      this.socket?.emit('join playground', playgroundID, user, (users: []) => {
        resolve(users);
      });
    });
  }
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
export const socketManager = new SocketIO(
  'https://express-server-production-06b3.up.railway.app/'
);
