import { useToast } from '@/components/ui/use-toast';
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
  const { toast } = useToast();
  const saveAsPresetMutation = useMutation({
    onError: (error) =>
      toast({
        title: 'Ahh something went wrong creating preset',
        description: JSON.stringify(error),
        variant: 'destructive',
      }),
    onSuccess: (res, context) => {
      toast({
        title: 'Success!',
        description: `Preset: ${context.name} has been saved`,
      });
    },
    mutationFn: async ({
      shapes,
      name,
      typeData,
      code,
      startNode,
    }: {
      shapes: {
        circles?: CircleReceiver[];
        lines?: Edge[];
        zoomAmount: number;
      };
      name: string;
      code: string;
      typeData: TypeMutation;
      startNode?: string;
    }) => {
      return await axios.post(API_URL + '/playground/preset/create', {
        circles: shapes.circles ?? [],
        lines: shapes.lines ?? [],
        name: name,
        zoomAmount: shapes.zoomAmount,
        code,
        startNode,
        ...typeData,
      });
    },
  });
  return saveAsPresetMutation;
};
