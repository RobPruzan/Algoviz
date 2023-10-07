import { API_URL, dispatchPreset } from '@/lib/utils';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useMeta } from './useMeta';

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
          validatorLens: z.array(z.any()).optional().or(z.object({})),
          zoomAmount: z.number(),
          startNode: z.string().optional().nullable(),
        })
      );
      console.log('data wee', res.data);
      const data = z.object({ presets: dataSchema }).parse(res.data);
      return data;
    },
  });

  return getPresetQuery;
};
