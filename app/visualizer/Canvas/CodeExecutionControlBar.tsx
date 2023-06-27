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
  return (
    <div className="w-full max-h-[7%] min-h-[50px]">
      <div className="  prevent-select overflow-x-scroll p-3 flex w-full border-secondary justify-evenly items-center border-b-2 ">
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

        <Button
          onClick={() => {
            if (currentAlgorithm?.code) {
              codeMutation.mutate(currentAlgorithm.code);
            }
          }}
          variant="outline"
          className="w-[90px]  flex items-center justify-center h-[30px]   font-bold"
        >
          Run
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
            {/* <RadioGroup

              defaultValue="comfortable"
            >
              <div className="grid grid-cols-4 items-center gap-4 ">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  value={userAlgorithm.description}
                  onChange={(e) =>
                    setUserAlgorithm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 my-2">
                <div className="flex items-center justify-evenly">
                  <Label htmlFor="description" className="text-right">
                    Validator
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="max-w-fit ml-auto">
                        <HelpCircle size={15} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>A validator algorithm will take in a datastructure and </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <RadioGroupItem value={'EDIT'} id="r1" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 my-2">

                <div className="flex items-center justify-around">
                  <Label htmlFor="description" className="text-right">
                    Visualization
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="max-w-fit ml-auto">
                        <HelpCircle size={15} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to library</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroupItem value={'READ-ONLY'} id="r2" />
              </div>
            </RadioGroup> */}
            {/* <div className="w-full h-28 flex justify-start">
              <div className="w-1/4 h-full flex flex-col">
                <div className="h-1/2 flex justify-end mr-2">
                  <Label htmlFor="r1">Destructure Validator</Label>
                </div>
                <div className="h-1/2 flex justify-end mr-2">
                  <Label htmlFor="r2">Algorithm Visualization</Label>
                </div>
              </div>
              <div className="w-3/4">
                <RadioGroup
                  className="flex flex-col justify-evenly"
                  // value={permissions}
                  // onValueChange={(v) => {
                  //   isPermission(v) && setPermissions(v);
                  // }}
                  defaultValue="comfortable"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={'EDIT'} id="r1" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={'READ-ONLY'} id="r2" />
                  </div>
                </RadioGroup>
              </div> */}
            {/* </div> */}

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
