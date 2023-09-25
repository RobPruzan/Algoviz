import { API_URL } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

export const useGetPresets = () => {
  const getPresetQuery = useQuery({
    queryKey: ['presets'],
    queryFn: async () => {
      const res = await axios.get(API_URL + '/playground/preset/get');
      const dataSchema = z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          code: z.union([z.string(), z.null()]),
          name: z.string(),
          createdAt: z.string(),
          circles: z.array(z.any()),
          lines: z.array(z.any()),
          zoomAmount: z.number(),
        })
      );

      const data = z.object({ presets: dataSchema }).parse(res.data);
      return data;
    },
  });
  return getPresetQuery;
};
