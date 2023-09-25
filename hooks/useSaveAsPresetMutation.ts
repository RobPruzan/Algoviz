import { CircleReceiver, Edge } from '@/lib/types';
import { API_URL } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import ky from 'ky';
export enum PresetType {
  DataStructure = 'DataStructure',
  Validator = 'Validator',
}

type TypeMutation =
  | {
      type: PresetType.DataStructure;
    }
  | {
      type: PresetType.Validator;
      code: string;
    };
export const useSaveAsPresetMutation = () => {
  const saveAsPresetMutation = useMutation({
    onError: (d, e) => console.log('fdasfd', d, e),
    mutationFn: async ({
      shapes,
      name,
      typeData,
    }: {
      shapes: {
        circles?: CircleReceiver[];
        lines?: Edge[];
        zoomAmount: number;
      };
      name: string;
      typeData: TypeMutation;
    }) => {
      // if (shapes.circles) {
      //   console.log('sending this out', {
      //     circles: shapes.circles,
      //     name: name,
      //     zoomAmount: shapes.zoomAmount,
      //     ...typeData,
      //   });
      //   await axios.post(`${API_URL}/playground/preset/create`, {
      //     circles: shapes.circles,
      //     name: name,
      //     zoomAmount: shapes.zoomAmount,
      //     ...typeData,
      //   });
      // }
      // if (shapes.lines) {
      //   console.log('sending this out', {
      //     lines: shapes.lines,
      //     name: name,
      //     zoomAmount: shapes.zoomAmount,
      //     ...typeData,
      //   });
      //   await axios.post(`${API_URL}/playground/preset/create`, {
      //     lines: shapes.lines,
      //     name: name,
      //     zoomAmount: shapes.zoomAmount,
      //     ...typeData,
      //   });
      // }

      return await axios.post(API_URL + '/playground/preset/create', {
        circles: shapes.circles ?? [],
        lines: shapes.lines ?? [],
        name: name,
        zoomAmount: shapes.zoomAmount,
        ...typeData,
      });
    },
  });
  return saveAsPresetMutation;
};
