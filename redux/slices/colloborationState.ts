import { FirstParameter } from '@/lib/types';
import { User } from '@prisma/client';
import { createSlice } from '@reduxjs/toolkit';
import { withMeta } from '../store';
import { useSession } from 'next-auth/react';

type CollabInfo = {
  mousePosition: [number, number];
  user: {
    id: string;
  } & Omit<Partial<User>, 'id'>;
};

type CollaborationState = {
  info: CollabInfo[];
};

type MetaParams<TPayload> = FirstParameter<
  typeof withMeta<TPayload, CollaborationState>
>;

const withCollabMeta = <TPayload>(args: MetaParams<TPayload>) =>
  withMeta<TPayload, CollaborationState>(args);

const initialState: CollaborationState = {
  info: [],
};

export const collaborationStateReducer = createSlice({
  initialState,
  name: 'collaborationState',
  reducers: {
    setUserMousePosition: withCollabMeta<CollabInfo>((state, action) => {
      for (const info of state.info) {
        if (info.user.id === action.payload.user.id) {
          info.mousePosition = action.payload.mousePosition;
          break;
        }
      }
    }),
  },
});

export const CollaborationActions = collaborationStateReducer.actions;
export const canvasReducer = collaborationStateReducer.reducer;
