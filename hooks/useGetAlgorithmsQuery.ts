import { API_URL } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

export const useGetAlgorithmsQuery = () =>
  useQuery({
    queryKey: ['getallAlgorithms'],
    queryFn: async () => {
      const algorithmSchema = z.object({
        id: z.string(),
        algoID: z.string(),
        userId: z.string(),
        title: z.string(),
        code: z.string(),
        description: z.string(),
        createdAt: z.string(),
        type: z.string(),
        isGodMode: z.boolean(),
        language: z.union([
          z.literal('javascript'),
          z.literal('typescript'),
          z.literal('python'),
          z.literal('java'),
          z.literal('rust'),
          // z.literal('go'),
        ]),
      });
      const res = (await axios.get(`${API_URL}/algo/getall`)).data;

      return z.array(algorithmSchema).parse(res);
    },
  });
