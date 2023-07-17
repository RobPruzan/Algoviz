import {
  AnyAction,
  Middleware,
  PayloadAction,
  configureStore,
} from '@reduxjs/toolkit';
import { CanvasActions, Meta, canvasReducer } from './slices/canvasSlice';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import { dfsReducer } from './slices/dfsSlice';
import { codeExecReducer } from './slices/codeExecSlice';
import { SocketIO, socket } from '@/lib/socket/socket-utils';
import { SocketAction, UntypedData } from '@/lib/types';
import {
  CollaborationActions,
  collaborationReducer,
  collaborationStateReducer,
} from './slices/colloborationSlice';
import { io } from 'socket.io-client';
import { type User } from 'next-auth';

export function withMeta<TPayload, TState>(
  reducer: (
    state: TState,
    action: PayloadAction<TPayload, string, Meta | undefined>
  ) => void
) {
  return {
    reducer,
    prepare: (payload: TPayload, meta?: Meta) => ({ payload, meta }),
  };
}

export const socketMiddleware =
  (socketManager: SocketIO): Middleware<{}, any> =>
  ({ dispatch, getState }) =>
  (next) =>
  (action: SocketAction & { meta: Meta | undefined }) => {
    const isSharedAction =
      action.type.startsWith('canvas/') ||
      action.type.startsWith('collaborationState/');

    switch (action.type) {
      case 'socket/connect':
        console.log('recieve connect', action.meta);
        if (action.meta?.playgroundID) {
          console.log('connecting to playground', action.meta.playgroundID);
          socketManager.socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
          socketManager
            .joinPlayground(action.meta.playgroundID, action.meta.user)
            .then((users) => {
              console.log('RESOLVING USERS, and acking', users);
              users.forEach((user) =>
                dispatch(CollaborationActions.addUser(user))
              );
            });
          socketManager.addActionListener((socketAction: SocketAction) => {
            if (socketAction.meta.userID !== action.meta.userID) {
              // note, performance is pretty good with circles, but awful with boxes, investigate
              dispatch(socketAction);
            }
          });
        }
        socketManager.socket?.on('user joined', (user: User) => {
          dispatch(collaborationStateReducer.actions.addUser(user));
        });
        break;
      case 'socket/disconnect':
        if (action.meta?.playgroundID) {
          socketManager.disconnect();
        }

      default:
        if (isSharedAction && action.meta && !action.meta.fromServer) {
          socketManager.sendSocketAction(action);
        }
    }

    return next(action);
  };

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    codeExec: codeExecReducer,
    // other state can be shared between clients, but this state is specifically for supporting collaboration
    collaborationState: collaborationReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware(socket)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
