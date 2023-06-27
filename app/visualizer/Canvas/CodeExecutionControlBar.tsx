import React, { useState } from 'react';
import { AlgoComboBox } from '../Sort/AlgoComboBox';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { codeExecActions } from '@/redux/slices/codeExecSlice';

import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/redux/store';

import { Algorithm } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { useGetAlgorithmsQuery } from '../hooks/useGetAlgorithmsQuery';
import { useCodeMutation } from '../hooks/useCodeMutation';
import { useSaveAlgorithmMutation } from '../hooks/useSaveAlgorithmMutation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { match } from 'ts-pattern';

type Props = {
  selectedAlgorithm: string | undefined;
  setSelectedAlgorithm: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
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

  const [tabValue, setTabValue] = useState<'visualizer' | 'validator'>(
    'visualizer'
  );

  const isValueTabType = (
    value: string
  ): value is 'visualizer' | 'validator' => {
    return value === 'visualizer' || value === 'validator';
  };
  return (
    <div className="w-full max-h-[7%] min-h-[50px]">
      <div className="  prevent-select overflow-x-scroll p-3 flex w-full border-secondary justify-evenly items-center border-b-2 ">
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
        <Popover>
          <PopoverTrigger>
            <Button
              className="min-w-fit flex items-center justify-center h-[30px] font-bold"
              variant={'outline'}
            >
              Options
            </Button>
          </PopoverTrigger>
          <PopoverContent>
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
              className=" flex p-1 justify-evenly items-center  w-full "
              onValueChange={(value) =>
                isValueTabType(value) && setTabValue(value)
              }
            >
              <TabsList className="w-full dark:bg-primary   flex justify-evenly items-center">
                <TabsTrigger
                  className={`w-2/5 ${
                    tabValue === 'visualizer'
                      ? 'border-2 rounded-md   '
                      : 'border-2 rounded-md border-secondary'
                  }`}
                  value="visualizer"
                >
                  Visualizer
                </TabsTrigger>
                <TabsTrigger
                  className={`w-2/5 ${
                    tabValue === 'validator'
                      ? 'border-2 rounded-md '
                      : 'border-2 rounded-md border-secondary'
                  }`}
                  value="validator"
                >
                  Validator
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {match(tabValue)
              .with('visualizer', () => <>vis</>)
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
          Debug
        </Button>
        <Button
          onClick={(e) => {
            dispatch(codeExecActions.toggleIsApplyingAlgorithm());
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
