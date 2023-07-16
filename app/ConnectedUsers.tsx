'use client';
import { useAppSelector } from '@/redux/store';
import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const ConnectedUsers = () => {
  const collabInfoState = useAppSelector((store) =>
    store.collaborationState.collabInfos.map((c) => c.user)
  );

  const totalUsers = collabInfoState.length;
  const usersAboveThree = totalUsers - 3;
  const isAboveThreeUsers = usersAboveThree > 0;

  const pathname = usePathname();
  if (!(pathname === '/visualizer')) return null;

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
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ConnectedUsers;
