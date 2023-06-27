import { AnyAction, Middleware, configureStore } from '@reduxjs/toolkit';
import { CanvasActions, Meta, canvasReducer } from './slices/canvasSlice';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import { dfsReducer } from './slices/dfsSlice';
import { codeExecReducer } from './slices/codeExecSlice';
import { SocketIO, socket } from '@/lib/socket/utils';
import { SocketAction, UntypedData } from '@/lib/types';

export const socketMiddleware =
  (socket: SocketIO): Middleware<{}, any> =>
  ({ dispatch, getState }) =>
  (next) =>
  (action: SocketAction & { meta: Meta | undefined }) => {
    switch (action.type) {
      case 'socket/connect':
        if (action.meta?.playgroundID) {
          socket.connect(action.meta.playgroundID);
          socket.addActionListener((socketAction: SocketAction) => {
            // need to not run the middleware if only 1 connected
            // console.log('receiving action');
            if (socketAction.meta.userID !== action.meta.userID) {
              // note, performance is pretty good with circles, but awful with boxes, investigate
              // console.log('dispatching server action');
              dispatch(socketAction);
            }
          });
        }
        break;

      default:
        if (
          action.type.startsWith('canvas/') &&
          action.meta &&
          !action.meta.fromServer
        ) {
          // console.log('sending action');
          socket.sendSocketAction(action);
        }
    }

    return next(action);
  };

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    dfs: dfsReducer,
    codeExec: codeExecReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware(socket)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
