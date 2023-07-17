import { FirstParameter } from '@/lib/types';
import { User } from '@prisma/client';
import { User as NextUser } from 'next-auth';
import { createSlice } from '@reduxjs/toolkit';
import { withMeta } from '../store';
import { useSession } from 'next-auth/react';

type CollabInfo = {
  mousePosition: [number, number];
  user: {
    id: string | null;
  } & Omit<Partial<User>, 'id'>;
};

type CollaborationState = {
  collabInfos: CollabInfo[];
};

type MetaParams<TPayload> = FirstParameter<
  typeof withMeta<TPayload, CollaborationState>
>;

const withCollabMeta = <TPayload>(args: MetaParams<TPayload>) =>
  withMeta<TPayload, CollaborationState>(args);

const initialState: CollaborationState = {
  collabInfos: [],
};

export const collaborationStateReducer = createSlice({
  initialState,
  name: 'collaborationState',
  reducers: {
    cleanupCollabInfo: (state) => {
      console.log('clean up state');
      state.collabInfos = [];
    },

    addCollabInfo: withCollabMeta<CollabInfo>((state, action) => {
      if (
        !state.collabInfos.some(
          (collabInfo) => collabInfo.user.id === action.payload.user.id
        )
      )
        state.collabInfos = [...state.collabInfos, action.payload];
    }),
    addUser: withCollabMeta<NextUser | { id: string }>((state, action) => {
      let setUser = false;
      for (const info of state.collabInfos) {
        if (info.user.id === action.payload.id) {
          setUser = true;
          info.user = action.payload;
          break;
        }
      }

      if (!setUser) {
        state.collabInfos = [
          ...state.collabInfos,
          {
            mousePosition: [0, 0],
            user: action.payload,
          },
        ];
      }
    }),

    setUserMousePosition: withCollabMeta<CollabInfo>((state, action) => {
      for (const info of state.collabInfos) {
        if (info.user.id === action.payload.user.id) {
          info.mousePosition = action.payload.mousePosition;
          break;
        }
      }
    }),
  },
});

export const CollaborationActions = collaborationStateReducer.actions;
export const collaborationReducer = collaborationStateReducer.reducer;
