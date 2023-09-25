import { usePathname } from 'next/navigation';

export const useIsGodMode = () => {
  const pathname = usePathname();
  const isGodMode = pathname.split('/').at(-1) === 'admin';
  return isGodMode;
};
