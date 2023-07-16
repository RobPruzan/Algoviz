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
      state.collabInfos = [];
    },

    addCollabInfo: withCollabMeta<CollabInfo>((state, action) => {
      console.log('new colab info', action.payload);
      if (
        !state.collabInfos.some(
          (collabInfo) => collabInfo.user.id === action.payload.user.id
        )
      )
        state.collabInfos = [...state.collabInfos, action.payload];
      // console.log('new state', state.collabInfos);
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

      console.log('set user', action.payload, setUser);

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
      // console.log(
      //   'huh',
      //   // state.collabInfos
      //   // 'yo dispatching usermouse pos', collabInfos,
      //   state.collabInfos.find((c) => c.user.id === action.meta?.userID)
      //     ?.mousePosition,
      //   state.collabInfos.find((c) => c.user.id === action.meta?.userID)?.user
      // );

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
