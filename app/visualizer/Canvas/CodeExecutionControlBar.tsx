import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { MODES, Modes, CodeExecActions } from '@/redux/slices/codeExecSlice';

import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/redux/store';

import { Algorithm } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { useGetAlgorithmsQuery } from '../hooks/useGetAlgorithmsQuery';
import { useCodeMutation } from '../hooks/useCodeMutation';
import { useSaveAlgorithmMutation } from '../hooks/useSaveAlgorithmMutation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { match } from 'ts-pattern';
import { getSelectedItems, twCond } from '@/lib/utils';
import { AlgoComboBox } from '../Sort/AlgoComboBox';
import { AlgoType, SelectedValidatorLens } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

type Props = {
  userAlgorithm: Pick<Algorithm, 'title' | 'code' | 'description' | 'type'>;
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<
      Pick<Algorithm, 'code' | 'description' | 'title' | 'type'>
    >
  >;
  codeMutation: ReturnType<typeof useCodeMutation>;
};

const CodeExecutionControlBar = ({
  setUserAlgorithm,
  userAlgorithm,
  codeMutation,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AlgoType>(AlgoType.Visualizer);

  const isApplyingAlgorithm = useAppSelector(
    (store) => store.codeExec.isApplyingAlgorithm
  );

  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );

  const dispatch = useAppDispatch();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  // const codeMutation = useCodeMutation();

  const saveAlgorithmMutation = useSaveAlgorithmMutation();

  const { toast } = useToast();

  const currentAlgorithm =
    userAlgorithm ??
    getAlgorithmsQuery.data?.find((d) => d.id === selectedAlgorithm);

  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas);

  const { selectedAttachableLines, selectedCircles } = getSelectedItems({
    attachableLines,
    circles,
    selectedGeometryInfo,
  });

  const ids = selectedAttachableLines
    .map((line) => line.id)
    .concat(selectedCircles.map((circle) => circle.id))
    .join(',');

  const isValidatorLens = currentAlgorithm?.type === 'validator';

  useEffect(() => {
    validatorLensContainer.forEach((lens) => {
      if (lens.selectedIds.length > 0) {
        const lensAlgo = getAlgorithmsQuery.data?.find(
          (d) => d.id === lens.algoId
        );
        // console.log('mi lens algo', lensAlgo);
        if (lensAlgo) {
          codeMutation.mutate({
            code: lensAlgo.code,
            type: AlgoType.Validator,
          });
        }
      }
    });
  }, [ids]);

  return (
    <div className="w-full max-h-[7%] min-h-[50px]">
      <div className="  prevent-select overflow-x-scroll p-3 flex w-full border-secondary justify-evenly items-center border-b-2 ">
        <Popover>
          <PopoverTrigger
            asChild
            className="min-w-fit flex items-center  justify-center h-[30px] font-bold"
          >
            <Button
              variant={'outline'}
              className="w-[90px]  flex items-center justify-center h-[30px]   font-bold"
              // asChild
            >
              Options
            </Button>
            {/* </Button> */}
          </PopoverTrigger>
          <PopoverContent className="pt-0">
            <div className="flex flex-col  items-start justify-evenly px-1 h-40 ">
              <p className="text-lg font-bold w-full text-center">Options</p>
              {getAlgorithmsQuery.isLoading ? (
                <AlgoComboBox
                  className="w-[150px]"
                  algorithms={[]}
                  defaultPlaceholder="Loading"
                  setValue={() => null}
                  value={null}
                />
              ) : (
                <AlgoComboBox
                  className="w-[150px]"
                  algorithms={getAlgorithmsQuery.data ?? []}
                  defaultPlaceholder="Algorithm"
                  value={selectedAlgorithm}
                  setValue={(value) =>
                    dispatch(CodeExecActions.setSelectedAlgorithm(value))
                  }
                />
              )}
              {/* <div className="flex items-center space-x-2">
                <Switch
                  onCheckedChange={(val) => {
                    dispatch(CodeExecActions.setApplyAlgoToWholeApp(val));
                    console.log(val);
                  }}
                  checked={appliedToWholeApp}
                  className=" border-2 data-[state=unchecked]:bg-secondary data-[state=unchecked]:border-gray-800  data-[state=checked]:bg-foreground data-[state=checked]:border-gray-100"
                  id="whole-canvas"
                />
                <Label htmlFor="whole-canvas">Apply to all canvas items</Label>
              </div> */}
            </div>

            {/* main option is what type do you want a validator or a visualizer
                need to tell the user the difference between the two
                can do tabs between the two to not couple them
                can then allow the user to pick defaults like shape type
                language
                will default to algo
            */}
          </PopoverContent>
        </Popover>

        <Button
          onClick={() => {
            if (currentAlgorithm?.code) {
              codeMutation.mutate({
                code: currentAlgorithm.code,
                type:
                  currentAlgorithm.type === AlgoType.Validator
                    ? AlgoType.Validator
                    : AlgoType.Visualizer,
              });
            } else {
              toast({
                title: 'No graph selected',
                description:
                  'You must have at least one node selected. You can select nodes by adding them, and then drag + mouse down',
              });
            }
          }}
          variant="outline"
          className="w-[90px]  flex items-center justify-center h-[30px]   font-bold"
        >
          Debug
        </Button>
        <Button
          onClick={(e) => {
            dispatch(CodeExecActions.toggleIsApplyingAlgorithm());
          }}
          variant="outline"
          className="w-[90px] flex items-center justify-center h-[30px]   font-bold"
        >
          {isApplyingAlgorithm ? 'Pause' : 'Apply'}
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-[100px] flex items-center justify-center h-[30px]   font-bold"
              variant="outline"
            >
              Save As
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Algorithm</DialogTitle>
              <DialogDescription>
                {
                  'Enter the information about your algorithm. Click confirm save when done.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Title
              </Label>
              <Input
                value={userAlgorithm.title}
                onChange={(e) =>
                  setUserAlgorithm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                id="name"
                className="col-span-3"
              />

              <Label htmlFor="name" className="text-right">
                Type
              </Label>
              <RadioGroup
                onValueChange={(e) => {
                  const valueIsAlgoType = (value: string): value is AlgoType =>
                    value === AlgoType.Validator ||
                    value === AlgoType.Visualizer;
                  valueIsAlgoType(e) && setType(e);
                }}
                value={type}
                defaultValue="Visualizer"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AlgoType.Visualizer} id="r1" />
                  <Label htmlFor="r1">Visualizer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AlgoType.Validator} id="r2" />
                  <Label htmlFor="r2">Validator</Label>
                </div>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  // i need to clean up this logic, and also invalidate the validators in the validators part of the canvas control bar
                  await saveAlgorithmMutation.mutateAsync({
                    ...userAlgorithm,
                    type,
                  });
                  setOpen(false);

                  getAlgorithmsQuery.refetch();
                }}
                variant="outline"
                type="submit"
              >
                {saveAlgorithmMutation.isLoading ? 'Loading' : 'Confirm Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CodeExecutionControlBar;
