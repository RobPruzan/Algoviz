import { Meta } from '@/redux/slices/canvasSlice';
import { useAppSelector } from '@/redux/store';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export const useMeta = () => {
  const searchParams = useSearchParams();
  const playgroundID = searchParams.get('playground-id');
  const session = useSession();
  const currentZoomFactor = useAppSelector(
    (store) => store.canvas.present.currentZoomFactor
  );
  const notSignedInUserID = useAppSelector(
    (store) => store.canvas.present.notSignedInUserID
  );

  const userID = session.data?.user.id ?? notSignedInUserID;
  const meta: Meta = {
    playgroundID,
    userID,
    user: session.data?.user || { id: userID },
    scaleFactor: currentZoomFactor,
  };

  return meta;
};
