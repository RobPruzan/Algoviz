import { AnyAction, Middleware, configureStore } from '@reduxjs/toolkit';
import { CanvasActions, Meta, canvasReducer } from './slices/canvasSlice';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import { dfsReducer } from './slices/dfsSlice';
import { codeExecReducer } from './slices/codeExecSlice';
import { SocketIO } from '@/lib/socket/utils';
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
  (socket: SocketIO): Middleware<{}, RootState> =>
  ({ dispatch, getState }) =>
  (next) =>
  (action: SocketAction & { meta: Meta | undefined }) => {
    switch (action.type) {
      case 'socket/connect':
        if (action.meta) {
          socket.connect(action.meta.playgroundID);
          // we can socket send the action and payload as is
          // we will receive it and just dispatch it
          socket.updateListener((action: SocketAction) => {
            dispatch(action);
          });
        }
        break;

      default:
        if (action.type.startsWith('canvas/')) {
          socket.sendUpdate;
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
  // middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
