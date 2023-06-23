import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useSaveAlgorithmMutation = () =>
  useMutation({
    mutationFn: async ({
      code,
      description,
      title,
    }: {
      code: string;
      description: string;
      title: string;
    }) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/create`, {
        code,
        title,
        description,
      });
    },
  });
