import React, { useState } from 'react';
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
import { twCond } from '@/lib/utils';
import { AlgoComboBox } from '../Sort/AlgoComboBox';
import { SelectedValidatorLens } from '@/lib/types';

type Props = {
  selectedAlgorithm: string | undefined;
  setSelectedAlgorithm: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  userAlgorithm: Pick<Algorithm, 'title' | 'code' | 'description'>;
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<Pick<Algorithm, 'code' | 'description' | 'title'>>
  >;
};

const CodeExecutionControlBar = ({
  selectedAlgorithm,
  setSelectedAlgorithm,
  setUserAlgorithm,
  userAlgorithm,
}: Props) => {
  const [open, setOpen] = useState(false);
  const isApplyingAlgorithm = useAppSelector(
    (store) => store.codeExec.isApplyingAlgorithm
  );

  const dispatch = useAppDispatch();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const codeMutation = useCodeMutation();

  const saveAlgorithmMutation = useSaveAlgorithmMutation();

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );

  const execMode = useAppSelector((store) => store.codeExec.mode);
  const appliedToWholeApp = useAppSelector(
    (store) => store.codeExec.appliedToWholeApp
  );

  const isValueMode = (value: string): value is Modes => {
    return MODES.some((mode) => mode === value);
  };
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
          <PopoverContent className="px-0">
            {/* {getAlgorithmsQuery.isLoading ? (
              <AlgoComboBox
                algorithms={[]}
                defaultPlaceholder="Loading"
                setValue={() => undefined}
                value={undefined}
              />
            ) : (
              <AlgoComboBox
                algorithms={getAlgorithmsQuery.data ?? []}
                defaultPlaceholder="Algorithm"
                value={selectedAlgorithm}
                setValue={(d) => {
                  setSelectedAlgorithm(d);
                }}
              />
            )} */}
            <Tabs
              defaultValue="input"
              className=" flex py-1 justify-evenly items-center  w-full border-b"
              onValueChange={(value) =>
                isValueMode(value) && dispatch(CodeExecActions.setMode(value))
              }
            >
              <TabsList className="w-full dark:bg-primary   flex justify-evenly items-center">
                <TabsTrigger
                  className={`w-2/5 ${
                    execMode === 'visualizer'
                      ? 'border-2 rounded-md   '
                      : 'border-2 rounded-md border-secondary'
                  }`}
                  value="visualizer"
                >
                  Visualizer
                </TabsTrigger>
                <TabsTrigger
                  className={`w-2/5 ${
                    execMode === 'validator'
                      ? 'border-2 rounded-md '
                      : 'border-2 rounded-md border-secondary'
                  }`}
                  value="validator"
                >
                  Validator
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* goal here is to allow to create different types of programs based on the selection
              - can select input type
              - can select color scheme
              - can select output type (i may prefer if this is done programmatically)
              - will do this after the mouse thingy
            */}
            {/* {console.log('fuck', appliedToWholeApp) ;return 'fdsaf'} */}
            {match(execMode)
              .with('visualizer', () => (
                <div className="flex flex-col p-3 ">
                  {getAlgorithmsQuery.isLoading ? (
                    <AlgoComboBox
                      algorithms={[]}
                      defaultPlaceholder="Loading"
                      setValue={() => undefined}
                      value={undefined}
                    />
                  ) : (
                    <AlgoComboBox
                      algorithms={getAlgorithmsQuery.data ?? []}
                      defaultPlaceholder="Algorithm"
                      value={selectedAlgorithm}
                      setValue={(d) => {
                        setSelectedAlgorithm(d);
                      }}
                    />
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      onCheckedChange={(val) => {
                        dispatch(CodeExecActions.setApplyAlgoToWholeApp(val));
                        console.log(val);
                      }}
                      checked={appliedToWholeApp}
                      className=" border-2 data-[state=unchecked]:bg-secondary data-[state=unchecked]:border-gray-800  data-[state=checked]:bg-foreground data-[state=checked]:border-gray-100"
                      // className={twCond([
                      //   {
                      //     cond: appliedToWholeApp,
                      //     className: 'bg-white',
                      //   },
                      //   {
                      //     cond: !appliedToWholeApp,
                      //     className:
                      //       ' data-[state=unchecked]:bg-input[data-state=unchecked]',
                      //   },
                      // ])}
                      id="whole-canvas"
                    />
                    <Label htmlFor="whole-canvas">
                      Apply to all canvas items
                    </Label>
                  </div>
                </div>
              ))
              .with('validator', () => <>val</>)
              .exhaustive()}

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
              codeMutation.mutate(currentAlgorithm.code);
            }
          }}
          variant="outline"
          className="w-[90px]  flex items-center justify-center h-[30px]   font-bold"
        >
          Execute
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
              className="w-[90px] flex items-center justify-center h-[30px]   font-bold"
              variant="outline"
            >
              Save
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
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  await saveAlgorithmMutation.mutateAsync(userAlgorithm);
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
