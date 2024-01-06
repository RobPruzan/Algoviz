import { Languages } from '@/lib/language-snippets';
import { AlgoType } from '@/lib/types';
import { API_URL } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname } from 'next/navigation';

export const useSaveAlgorithmMutation = () => {
  const pathname = usePathname();
  const isGodMode = pathname.split('/').at(-1) === 'admin';
  const saveAlgoMutation = useMutation({
    mutationFn: async ({
      code,
      description,
      title,
      type,
      language,
      algoID,
    }: {
      code: string;
      description: string;
      title: string;
      type: AlgoType;
      language: Languages;
      algoID: string;
    }) => {
      await axios.post(`${API_URL}/algo/create`, {
        code,
        title,
        description,
        type,
        language,
        algoID,
        isGodMode,
      });
    },
    onError: (e) => {},
    onSuccess: (s) => {},
  });
  return saveAlgoMutation;
};
