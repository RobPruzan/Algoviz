'use client';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket/socket-utils';
import { CollaborationActions } from '@/redux/slices/colloborationSlice';
import { useSession } from 'next-auth/react';
import { useMeta } from '@/hooks/useMeta';

const ConnectedUsers = () => {
  const collabInfoState = useAppSelector((store) =>
    store.collaborationState.collabInfos.map((c) => c.user)
  );
  const pathname = usePathname();
  const playgroundID = useSearchParams().get('playground-id');
  const dispatch = useAppDispatch();
  const session = useSession();
  const meta = useMeta();

  useEffect(() => {
    if (playgroundID && session.status !== 'loading') {
      console.log('run');
      socket.getConnectedUsers(playgroundID).then((users) => {
        console.log('returned users: ', users);
        users.forEach((user) => dispatch(CollaborationActions.addUser(user)));
      });
    } else {
      console.log('not running bitch');
    }
    // return () => {
    //   console.log('cleanup');
    //   dispatch(CollaborationActions.cleanupCollabInfo());
    // };
  }, [dispatch, playgroundID, session.status]);

  useEffect(() => {
    // putting a condition here of session.status === 'loading' still breaks even with the updated cleanup logic
    console.log('running the connect effect, pgID', playgroundID);
    if (!playgroundID) return;
    console.log('dispatching connect');
    dispatch({
      type: 'socket/connect',
      meta,
    });
    // need to understand the problem with waiting for the session to load :/
    return () => {
      if (!playgroundID) return;
      console.log('disconeccting');
      dispatch({
        type: 'socket/disconnect',
        meta,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundID]);

  const totalUsers = collabInfoState.length;
  const usersAboveThree = totalUsers - 3;
  // const isAboveThreeUsers = usersAboveThree > 0;

  if (pathname !== '/visualizer') return null;

  return (
    <div className="flex  items-center justify-center overflow-y-scroll border-2 h-[40px]  rounded-md px-2">
      {collabInfoState.map((collab, index) =>
        index > 3 ? null : index > 2 ? (
          <div className=" w-1/4 text-sm" key={collab.id}>
            and {usersAboveThree} more
          </div>
        ) : (
          <div key={collab.id}>
            <div className="border border-black rounded-md p-2 text-sm">
              <Image
                alt="user avatar"
                src={collab.image ?? '/default-avatar.png'}
                width={25}
                height={25}
              />
              {collab.name ?? 'anon'}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ConnectedUsers;
