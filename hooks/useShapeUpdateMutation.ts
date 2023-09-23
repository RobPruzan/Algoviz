import { CircleReceiver, Edge } from '@/lib/types';
import { API_URL } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { useSearchParams } from 'next/navigation';

export const useShapeUpdateMutation = () => {
  const searchParams = useSearchParams();
  return useMutation({
    mutationFn: async (shapes: {
      circles?: CircleReceiver[];
      lines?: Edge[];
      zoomAmount: number;
    }) => {
      const playgroundID = searchParams.get('playground-id');
      if (!playgroundID) {
        return Promise.reject('No playground id');
      }
      if (shapes.circles) {
        await ky.put(`${API_URL}/playground/shapes/update`, {
          json: {
            circles: shapes.circles,
            playgroundID: +playgroundID,
            zoomAmount: shapes.zoomAmount,
          },
        });
      }
      if (shapes.lines) {
        await ky.put(`${API_URL}/playground/shapes/update`, {
          json: {
            lines: shapes.lines,
            playgroundID: +playgroundID,
            zoomAmount: shapes.zoomAmount,
          },
        });
      }
    },
  });
};
