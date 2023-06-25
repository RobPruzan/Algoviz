import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

export const useGetAlgorithmsQuery = () =>
  useQuery({
    queryKey: ['getallAlgorithms'],
    queryFn: async () => {
      const algorithmSchema = z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        code: z.string(),
        description: z.string(),
        createdAt: z.string(),
      });
      const res = (
        await axios.get(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/getall`)
      ).data;
      console.log('the res that is failing', res);
      return z.array(algorithmSchema).parse(res);
    },
  });
