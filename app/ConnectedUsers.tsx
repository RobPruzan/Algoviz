'use client';
import { useAppSelector } from '@/redux/store';
import React from 'react';
import Image from 'next/image';

const ConnectedUsers = () => {
  const collabInfoState = useAppSelector(
    (store) => store.collaborationState.collabInfos
  );
  return (
    <div className="flex  items-center justify-center overflow-y-scroll ">
      {collabInfoState.map((collab) => (
        <div key={collab.user.id}>
          <div className="border border-black rounded-md p-2 text-sm">
            <Image
              alt="user avatar"
              src={collab.user.image ?? '/default-avatar.png'}
              width={25}
              height={25}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConnectedUsers;
