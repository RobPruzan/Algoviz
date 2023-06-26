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

// type ActonTypes = keyof typeof CanvasActions
// // type ActionPayloads =  (typeof CanvasActions)[ActonTypes]
// type ActionPayloads = {
//   [Key in ActonTypes]: (typeof CanvasActions)[ActonTypes]
// }

// type SocketData = {
//   action: `canvas/${ActonTypes}`,
//   payload: ActionPayloads
// }

export const socketMiddleware =
  (socket: SocketIO): Middleware<{}, any> =>
  ({ dispatch, getState }) =>
  (next) =>
  (action: SocketAction & { meta: Meta | undefined }) => {
    switch (action.type) {
      case 'socket/connect':
        if (action.meta?.playgroundID) {
          // const socket = new SocketIO('http://localhost:8080');
          console.log('connecting to socket');
          socket.connect(action.meta.playgroundID);
          // we can socket send the action and payload as is
          // we will receive it and just dispatch it
          socket.actionListener((socketAction: SocketAction) => {
            // console.log(
            //   'original action is',
            //   JSON.stringify(action),
            //   action.meta?.userID
            // );
            // console.log(
            //   `current user is: ${action.meta?.userID}, the sender is ${socketAction.meta.userID}`
            // );
            console.log(
              'getting action and sending this specific action',
              socketAction
            );
            if (socketAction.meta.userID !== action.meta.userID) {
              // console.log(
              //   `dispatching, the current user is: ${action.meta.userID}, the sender is ${socketAction.meta.userID}`
              // );
              // note, performance is pretty good with circles, but awful with boxes, investigate
              dispatch(socketAction);
            }
          });
        }
        break;

      default:
        console.log('action coming in', action);
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

const storeMiddleWare = (getDefaultMiddleware: any) =>
  getDefaultMiddleware().concat(socketMiddleware(socket));

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    dfs: dfsReducer,
    codeExec: codeExecReducer,
  },
  middleware: storeMiddleWare,

  // middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
