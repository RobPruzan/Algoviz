import { Languages } from '@/lib/language-snippets';
import { AlgoType } from '@/lib/types';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useSaveAlgorithmMutation = () =>
  useMutation({
    mutationFn: async ({
      code,
      description,
      title,
      type,
      language,
    }: {
      code: string;
      description: string;
      title: string;
      type: AlgoType;
      language: Languages;
    }) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/create`, {
        code,
        title,
        description,
        type,
        language,
      });
    },
    onError: (e) => {},
    onSuccess: (s) => {},
  });
