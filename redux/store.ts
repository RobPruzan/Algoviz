import {
  AnyAction,
  Middleware,
  PayloadAction,
  configureStore,
} from '@reduxjs/toolkit';
import {
  CanvasActions,
  Meta,
  ObjectState,
  canvasReducer,
} from './slices/canvasSlice';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import { dfsReducer } from './slices/dfsSlice';
import { codeExecReducer } from './slices/codeExecSlice';
import { SocketIO, socketManager } from '@/lib/socket/socket-utils';
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
  ({
    dispatch,
    getState,
  }: {
    dispatch: typeof store.dispatch;
    getState: typeof store.getState;
  }) =>
  (next) =>
  (action: SocketAction & { meta: Meta | undefined }) => {
    const isSharedAction =
      action.type.startsWith('canvas/') ||
      action.type.startsWith('collaborationState/');

    switch (action.type) {
      case 'socket/connect':
        if (action.meta?.playgroundID) {
          socketManager.socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
          socketManager
            .joinPlayground(action.meta.playgroundID, action.meta.user)
            .then((users) => {
              users.forEach((user) =>
                dispatch(CollaborationActions.addUser(user))
              );
            })
            .catch((err) => {
              console.log('ERROR adding user', err);
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
          // user meta is a closure over the original connect dispatch at page mount

          if (
            action.meta.playgroundID &&
            getState().collaborationState.ownerID === action.meta.userID
          ) {
            const objectState: ObjectState = getState().canvas;

            socketManager.emitSynchronizeObjectState(
              objectState,
              getState().canvas.cameraCoordinate,
              getState().canvas.currentZoomFactor,
              action.meta.playgroundID
            );
          }
        });
        socketManager.socket?.on(
          'synchronize',
          (
            state: ObjectState,
            cameraCoordinate: [number, number],
            zoomFactor: number
          ) => {
            action.meta.realCoordinateCenter &&
              dispatch(
                CanvasActions.synchronizeObjectState({
                  state,
                  cameraCoordinate,
                  realCoordinateCenter: action.meta.realCoordinateCenter,
                  zoomFactor,
                })
              );
          }
        );
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
    getDefaultMiddleware().concat(socketMiddleware(socketManager)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
