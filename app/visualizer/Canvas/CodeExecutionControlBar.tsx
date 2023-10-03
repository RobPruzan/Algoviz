import React, {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { match } from 'ts-pattern';
import {
  DEFAULT_VISUALIZATION_CODE,
  GREEN_BLINKING_PRESETS,
  getCode,
  getSelectedItems,
  getValidatorLensSelectedIds,
  run,
  twCond,
} from '@/lib/utils';

import { AlgoType, Prettify, SelectedValidatorLens } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

import {
  ArrowDown,
  Bug,
  ChevronDown,
  Pause,
  Play,
  Save,
  SaveAll,
} from 'lucide-react';
import { ChevronUp } from 'lucide-react';
import { LanguageComboBox } from '../LanguageComboBox';
import { Languages, languageSnippets } from '@/lib/language-snippets';
import { useCodeMutation } from '@/hooks/useCodeMutation';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import { useSaveAlgorithmMutation } from '@/hooks/useSaveAlgorithmMutation';
import { AlgoComboBox } from '../Sort/AlgoComboBox';
import { CodeStorage } from '@/hooks/codeStorage';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAdjacencyList } from '@/lib/graph';

const startNodeAnnotation = ', startNode: NodeID';
const endNodeAnnotation = ', endNode: NodeID';

type CodeExecParameters = {
  passStartNode: boolean;
  passEndNode: boolean;
};
const DONT_PURGE_IT_TAILWIND_AHHHHHHHHHHHHHHHHHH = 'animate-pulse bg-green-600';
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
  codeMutation: ReturnType<typeof useCodeMutation>['codeMutation'];
  autoSelectAll: boolean;
  setAutoSelectAll: Dispatch<SetStateAction<boolean>>;
  openLanguageComboBox: boolean;
  setOpenLanguageComboBox: Dispatch<SetStateAction<boolean>>;
  language: Languages;
  setLanguage: Dispatch<SetStateAction<Languages>>;
  setTabValue: React.Dispatch<React.SetStateAction<'output' | 'input'>>;
  tabValue: 'output' | 'input';
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
  const presetCode = useAppSelector((store) => store.canvas.present.presetCode);
  const searchParams = useSearchParams();

  const lastInput = useRef('');
  const selectedIds = getValidatorLensSelectedIds({
    attachableLines,
    circles,
    validatorLensContainer,
  }).join(',');
  const codeInfo = run(() => {
    if (presetCode) {
      return { code: presetCode, type: AlgoType.Visualizer, id: null };
    }
    if (userAlgorithm.code !== DEFAULT_VISUALIZATION_CODE) {
      return { ...userAlgorithm, id: null };
    }
    if (currentAlgorithm) {
      return currentAlgorithm;
    } else {
      return {
        code: DEFAULT_VISUALIZATION_CODE,
        type: AlgoType.Visualizer,
        id: null,
      };
    }
  });

  const { getAdjacenyList } = useCodeMutation();
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
            selectAll: autoSelectAll,
          });
        } else {
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);
  const [shouldBounceGreen, setShouldBounceGreen] = useState(false);
  // const visualization = useAppSelector((store) => store.codeExec.visualization);
  useEffect(() => {
    const cond =
      searchParams.get('preset') &&
      JSON.parse(
        localStorage.getItem(
          searchParams
            // lol
            .get('preset')!
        ) ?? '{"firstTime":true}'
      ).firstTime;

    if (
      cond &&
      !GREEN_BLINKING_PRESETS.includes(searchParams.get('preset') ?? 'nope')
    ) {
      toast({
        title: 'Welcome!',
        duration: 10000,
        description:
          'You can pan/zoom around to get a better view, or move the nodes around by dragging them. You can also write code to operate on the data structure/s with the built in code editor!',
      });
      setShouldBounceGreen(false);
      return;
    }
    if (cond) {
      // const descriptions =  searchParams.get('preset') ===
      toast({
        title: 'Welcome!',
        duration: 15000,
        description:
          'Click the pulsing green play button to see a visualization. You can pan/zoom around to get a better view, or move the nodes/edges by dragging them',
      });
    }
    setShouldBounceGreen(cond);
  }, [searchParams, toast]);

  // console.log('SHOULD IT BOUNCE DO', shouldBounceGreen);

  // console.log('booo', shouldBounceGreen, searchParams.includes('preset'));

  return (
    <>
      <div className="w-full  ">
        <div className="   h-[60px] overflow-x-scroll p-3 flex w-full border-secondary justify-evenly items-center border-b-2 ">
          <Popover>
            <PopoverTrigger
              asChild
              className="min-w-fit flex items-center  justify-center h-[30px] font-bold"
            >
              <Button
                aria-label="code-options"
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
                      defaultPlaceholder="Loading..."
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
            onSelect={(currentValue) => {
              setLanguage(
                currentValue === language
                  ? ('' as Languages)
                  : (currentValue as Languages)
              );
              CodeStorage.setCode((prev) => ({
                ...prev,
                language: currentValue,
              }));
              setOpenLanguageComboBox(false);

              setUserAlgorithm((prev) => ({
                ...prev,
                code: languageSnippets[currentValue],
              }));
              setLanguage(currentValue);
            }}
            value={language}
          />
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                <Button
                  aria-label="debug-algorithm"
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
                      const code = getCode(userAlgorithm, presetCode);
                      // console.log('hola amigo', code);
                      codeMutation.mutate({
                        type:
                          codeInfo.type === AlgoType.Validator
                            ? AlgoType.Validator
                            : AlgoType.Visualizer,
                        algo: { code: code },
                        language,
                        selectAll: autoSelectAll,
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
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Debug code and view output</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                <Button
                  aria-label="toggle-algorithm-visualization"
                  onClick={async (e) => {
                    setTabValue('output');
                    const presetResult = searchParams.get('preset');
                    if (presetResult) {
                      setShouldBounceGreen(false);
                      localStorage.setItem(
                        presetResult,
                        JSON.stringify({
                          // ...JSON.parse(presetResult),
                          firstTime: false,
                        })
                      );
                    }
                    const code = getCode(userAlgorithm, presetCode);
                    const currentCacheKey = JSON.stringify([
                      getAdjacenyList(attachableLines, circles),
                      code,
                      startNode,
                    ]);

                    const previousCacheKey = lastInput.current;

                    if (currentCacheKey !== previousCacheKey) {
                      const res = await codeMutation.mutateAsync({
                        type: AlgoType.Visualizer,
                        algo: { code: getCode(userAlgorithm, presetCode) },
                        endNode,
                        startNode,
                        language,
                        selectAll: autoSelectAll,
                      });

                      if (res?.type === 'error') {
                        dispatch(CodeExecActions.setVisitedVisualization([]));
                        dispatch(CodeExecActions.setIsApplyingAlgorithm(false));
                        dispatch(CodeExecActions.resetVisitedPointer());

                        return;
                      }

                      // literally a cache key
                      lastInput.current = JSON.stringify([
                        getAdjacenyList(attachableLines, circles),
                        code,
                        startNode,
                      ]);
                      dispatch(CodeExecActions.resetVisitedPointer());
                      dispatch(CodeExecActions.setIsApplyingAlgorithm(true));
                      return;
                    }

                    dispatch(CodeExecActions.toggleIsApplyingAlgorithm());
                    // localStorage.setItem;
                  }}
                  variant="outline"
                  className={`w-fit flex items-center justify-center h-[30px]     font-bold ${
                    shouldBounceGreen
                      ? 'animate-pulse bg-green-600 DONT PURGE IT YOO'
                      : ''
                  }`}
                >
                  {/* {isApplyingAlgorithm ? 'Pause' : 'Apply'} */}
                  {/* icon version */}
                  {isApplyingAlgorithm ? (
                    <Pause className="w-[20px] h-[20px]" />
                  ) : (
                    <Play className="w-[20px] h-[20px]" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Run algorithm on graph</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="ml-2" asChild>
                  <DialogTrigger asChild>
                    <Button
                      aria-label="save-algorithm"
                      className="w-fit flex items-center justify-center h-[30px]   font-bold"
                      variant="outline"
                    >
                      <Save />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>Save algorithm as</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
                  aria-label="confirm-save-algorithm"
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
                  {saveAlgorithmMutation.isLoading
                    ? 'Saving...'
                    : 'Confirm Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* <Buttonpu
            variant={'outline'}
            onClick={() => setShowAlgoHistorySlider((prev) => !prev)}
          >
            {showAlgoHistorySlider ? <ChevronUp /> : <ChevronDown />}
          </Buttonpu> */}
        </div>
      </div>
    </>
  );
};

export default CodeExecutionControlBar;
