import { Languages } from '@/lib/language-snippets';
import { AlgoType } from '@/lib/types';
import { API_URL } from '@/lib/utils';
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
      });
    },
    onError: (e) => {},
    onSuccess: (s) => {},
  });
