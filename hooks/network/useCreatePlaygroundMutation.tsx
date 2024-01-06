import { SerializedPlayground } from '@/lib/types';
import { API_URL, serializedPlaygroundSchema } from '@/lib/utils';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { z } from 'zod';

export const useCreatePlaygroundMutation = () => {
  const queryClient = useQueryClient();

  const createPlaygroundMutation = useMutation({
    mutationFn: async () => {
      const json = await ky.post(`${API_URL}/playground/create`).json();

      const resPlaygroundSchema = z.object({
        playground: serializedPlaygroundSchema,
      });

      return resPlaygroundSchema.parse(json);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SerializedPlayground[]>(
        ['getPlaygrounds'],
        (playground) =>
          playground ? [data.playground, ...playground] : playground
      );
    },
  });

  return createPlaygroundMutation;
};
