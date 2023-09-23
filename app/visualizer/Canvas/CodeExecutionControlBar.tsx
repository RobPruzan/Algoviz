import React, {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Checkbox } from '@/components/ui/checkbox';

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { match } from 'ts-pattern';
import {
  DEFAULT_VISUALIZATION_CODE,
  getSelectedItems,
  getValidatorLensSelectedIds,
  twCond,
} from '@/lib/utils';

import { AlgoType, Prettify, SelectedValidatorLens } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import AlgoHistorySlider from '../Sort/AlgoHistorySlider';
import { Bug, ChevronDown, Pause, Play, Save, SaveAll } from 'lucide-react';
import { ChevronUp } from 'lucide-react';
import { LanguageComboBox } from '../LanguageComboBox';
import { Languages, languageSnippets } from '@/lib/language-snippets';
import { useCodeMutation } from '@/hooks/useCodeMutation';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import { useSaveAlgorithmMutation } from '@/hooks/useSaveAlgorithmMutation';
import { AlgoComboBox } from '../Sort/AlgoComboBox';

type Props = {
  userAlgorithm: Pick<
    Algorithm,
    'title' | 'code' | 'description' | 'type' | 'language'
  >;
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<
      Pick<Algorithm, 'title' | 'code' | 'description' | 'type' | 'language'>
    >
  >;
  codeMutation: ReturnType<typeof useCodeMutation>;
  autoSelectAll: boolean;
  setAutoSelectAll: Dispatch<SetStateAction<boolean>>;
  openLanguageComboBox: boolean;
  setOpenLanguageComboBox: Dispatch<SetStateAction<boolean>>;
  language: Languages;
  setLanguage: Dispatch<SetStateAction<Languages>>;
  setTabValue: React.Dispatch<React.SetStateAction<'output' | 'input'>>;
  tabValue: 'output' | 'input';
};

const startNodeAnnotation = ', startNode: NodeID';
const endNodeAnnotation = ', endNode: NodeID';

type CodeExecParameters = {
  passStartNode: boolean;
  passEndNode: boolean;
};

const parseCode = ({
  code,
  passEndNode,
  passStartNode,
}: CodeExecParameters & { code: string }) => {
  let codeWithAddedParameters = parseCodeAndAddParameters({
    code,
    passEndNode,
    passStartNode,
  });

  if (!passStartNode) {
    codeWithAddedParameters = codeWithAddedParameters.replace(
      startNodeAnnotation,
      ''
    );
  }

  if (!passEndNode) {
    codeWithAddedParameters = codeWithAddedParameters.replace(
      endNodeAnnotation,
      ''
    );
  }

  return codeWithAddedParameters;
};

const parseCodeAndAddParameters = ({
  passEndNode,
  passStartNode,
  code,
}: CodeExecParameters & { code: string }) => {
  let newCode: string = '';
  let pointer = 0;

  const tokens = code.split(' ');
  const hasStartNode = tokens.some((token) => token === 'startNode:');
  const hasEndNode = tokens.some((token) => token === 'endNode:');
  const startNodeText = !hasStartNode ? startNodeAnnotation : '';
  const endNodeText = !hasEndNode ? endNodeAnnotation : '';

  while (pointer + 1 < code.length) {
    if (code[pointer] === ')' && code[pointer + 1] === ':') {
      if (passStartNode && passEndNode) {
        newCode += startNodeText;
        newCode += endNodeText;
      } else if (passStartNode) {
        newCode += startNodeText;
      } else if (passEndNode) {
        newCode += endNodeText;
      }
    }

    newCode += code[pointer];
    pointer++;

    // while
  }

  newCode += code[pointer];

  return newCode;
};

const CodeExecutionControlBar = ({
  setUserAlgorithm,
  userAlgorithm,
  codeMutation,
  autoSelectAll,
  setAutoSelectAll,
  language,
  openLanguageComboBox,
  setLanguage,
  setOpenLanguageComboBox,
  setTabValue,
  tabValue,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AlgoType>(AlgoType.Visualizer);

  const [codeExecParameters, setCodeExecParameters] =
    useState<CodeExecParameters>({
      passStartNode: true,
      passEndNode: true,
    });

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

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );

  const {
    attachableLines,
    circles,

    validatorLensContainer,
    endNode,
    startNode,
  } = useAppSelector((store) => store.canvas.present);

  const visualization = useAppSelector((store) => store.codeExec.visualization);
  const results = validatorLensContainer.map((lens) => lens.result);

  const selectedIds = getValidatorLensSelectedIds({
    attachableLines,
    circles,
    validatorLensContainer,
  }).join(',');

  const isValidatorLens = currentAlgorithm?.type === 'validator';

  // const code = userAlgorithm.code ?? currentAlgorithm?.code;
  const codeInfo =
    userAlgorithm.code !== DEFAULT_VISUALIZATION_CODE
      ? { ...userAlgorithm, id: null }
      : currentAlgorithm ?? {
          code: DEFAULT_VISUALIZATION_CODE,
          type: AlgoType.Visualizer,
          id: null,
        };

  useEffect(() => {
    validatorLensContainer.forEach((lens) => {
      if (lens.selectedIds.length > 0) {
        const lensAlgo = getAlgorithmsQuery.data?.find(
          (d) => d.algoID === lens.algoID
        );

        if (lensAlgo) {
          codeMutation.mutate({
            language,
            algo: lensAlgo,
            type: AlgoType.Validator,
            lens,
            startNode,
            endNode,
          });
        } else {
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  return (
    <>
      <div className="w-full  ">
        <div className="  prevent-select h-[60px] overflow-x-scroll p-3 flex w-full border-secondary justify-evenly items-center border-b-2 ">
          <Popover>
            <PopoverTrigger
              asChild
              className="min-w-fit flex items-center  justify-center h-[30px] font-bold"
            >
              <Button
                variant={'outline'}
                className="w-[90px]  flex items-center justify-center h-[30px]   font-bold"
              >
                Options
              </Button>
              {/* </Button> */}
            </PopoverTrigger>
            <PopoverContent className="pt-0">
              <div className="flex flex-col  items-start justify-evenly px-1 h-40 ">
                <p className="text-lg font-bold w-full text-center">Options</p>
                <div className="flex items-center space-x-2">
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
                      setValue={(value) => {
                        const algos = getAlgorithmsQuery.data ?? [];
                        dispatch(CodeExecActions.setSelectedAlgorithm(value));
                        const algo = algos.find((d) => d.id === value);

                        if (algo) {
                          setUserAlgorithm((prev) => ({
                            ...prev,
                            code: algo.code,
                            language: algo.language,
                          }));
                          setLanguage(algo.language);
                        }
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    // value={codeExecParameters.passStartNode}
                    // onChange={(e) => setCodeExecParameters}
                    checked={codeExecParameters.passStartNode}
                    onCheckedChange={(checkedState) =>
                      typeof checkedState == 'boolean' &&
                      setCodeExecParameters((prev) => {
                        setUserAlgorithm((prev) => ({
                          ...prev,
                          code: parseCode({
                            code: codeInfo.code,
                            passEndNode: codeExecParameters.passEndNode,
                            passStartNode: checkedState,
                          }),
                        }));
                        return {
                          ...prev,
                          passStartNode: checkedState,
                        };
                      })
                    }
                    id="start-node"
                  />
                  <label
                    htmlFor="start-node"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Pass start node
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="end-node"
                    checked={codeExecParameters.passEndNode}
                    onCheckedChange={(checkedState) =>
                      typeof checkedState == 'boolean' &&
                      setCodeExecParameters((prev) => {
                        setUserAlgorithm((prev) => ({
                          ...prev,
                          code: parseCode({
                            code: codeInfo.code,
                            passEndNode: checkedState,
                            passStartNode: codeExecParameters.passStartNode,
                          }),
                        }));
                        return {
                          ...prev,
                          passEndNode: checkedState,
                        };
                      })
                    }
                  />

                  <label
                    htmlFor="end-node"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Pass end node
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={autoSelectAll}
                    onCheckedChange={(v) => {
                      v !== 'indeterminate' && setAutoSelectAll(v);
                    }}
                    id="auto-select-all"
                  />
                  <label
                    id="auto-select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto-select all nodes
                  </label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <LanguageComboBox
            open={openLanguageComboBox}
            setOpen={setOpenLanguageComboBox}
            // setValue={(val) => {
            // setUserAlgorithm((prev) => ({
            //   ...prev,
            //   code: languageSnippets[val],
            // }));
            // setLanguage(val);
            // }}
            onSelect={(currentValue) => {
              setLanguage(
                currentValue === language
                  ? ('' as Languages)
                  : (currentValue as Languages)
              );
              setOpenLanguageComboBox(false);

              setUserAlgorithm((prev) => ({
                ...prev,
                code: languageSnippets[currentValue],
              }));
              setLanguage(currentValue);
            }}
            value={language}
          />
          <Button
            onClick={() => {
              if (!codeInfo) {
                toast({
                  title: `You haven't written any code yet`,
                  description: 'Lets write some code first',
                });
                return;
              }
              if (!selectedIds) {
                setTabValue('output');
                codeMutation.mutate({
                  type:
                    codeInfo.type === AlgoType.Validator
                      ? AlgoType.Validator
                      : AlgoType.Visualizer,
                  algo: { code: codeInfo.code },
                  language,

                  endNode,
                  startNode,
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
            className="w-fit  flex items-center justify-center h-[30px]   font-bold"
          >
            <Bug />
          </Button>
          <Button
            onClick={async (e) => {
              setTabValue('output');
              await codeMutation.mutateAsync({
                type: AlgoType.Visualizer,
                algo: { code: codeInfo.code },
                endNode,
                startNode,
                language,
              });
              dispatch(CodeExecActions.toggleIsApplyingAlgorithm());
            }}
            variant="outline"
            className="w-fit flex items-center justify-center h-[30px]   font-bold"
          >
            {/* {isApplyingAlgorithm ? 'Pause' : 'Apply'} */}
            {/* icon version */}
            {isApplyingAlgorithm ? (
              <Pause className="w-[20px] h-[20px]" />
            ) : (
              <Play className="w-[20px] h-[20px]" />
            )}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-fit flex items-center justify-center h-[30px]   font-bold"
                variant="outline"
              >
                <Save />
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
                    const valueIsAlgoType = (
                      value: string
                    ): value is AlgoType =>
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
                      language,
                      algoID: crypto.randomUUID(),
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
          {/* <Button
            variant={'outline'}
            onClick={() => setShowAlgoHistorySlider((prev) => !prev)}
          >
            {showAlgoHistorySlider ? <ChevronUp /> : <ChevronDown />}
          </Button> */}
        </div>
      </div>
    </>
  );
};

export default CodeExecutionControlBar;
