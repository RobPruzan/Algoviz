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
    }: {
      code: string;
      description: string;
      title: string;
      type: AlgoType;
    }) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/create`, {
        code,
        title,
        description,
        type,
      });
    },
    onError: (e) => {
      console.log('fuck', e);
    },
    onSuccess: (s) => {
      console.log('woo it worked');
    },
  });
