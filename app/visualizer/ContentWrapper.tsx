'use client';
import {
  AlgoType,
  CircleReceiver,
  Edge,
  Percentage,
  PickedPlayground,
  SelectedGeometryInfo,
  SelectedValidatorLens,
} from '@/lib/types';
import React, { useEffect, useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import Visualize from './Visualize';
import { Algorithm, Prisma } from '@prisma/client';
import CodeExecutionControlBar from './Canvas/CodeExecutionControlBar';
import {
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
} from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppSelector } from '@/redux/store';
import { match } from 'ts-pattern';

import { CollaborationActions } from '@/redux/slices/colloborationSlice';
import { useMeta } from '@/hooks/useMeta';
import { useToast } from '@/components/ui/use-toast';
import { Languages, languageSnippets } from '@/lib/language-snippets';
import { useCodeMutation } from '@/hooks/useCodeMutation';
import { AxiosError } from 'axios';
import { useIsGodMode } from '@/hooks/isGodMode';
type Props = {
  data: PickedPlayground | null;
};

const ContentWrapper = ({ data }: Props) => {
  const [canvasWidth, setCanvasWidth] = useState<number | Percentage>('59.2%');
  const [codeExecWidth, setCodeExecWidth] = useState<number | Percentage>(
    '40%'
  );
  const [selectedValidatorLens, setSelectedValidatorLens] =
    useState<SelectedValidatorLens | null>(null);

  const [openLanguageComboBox, setOpenLanguageComboBox] = useState(false);
  const [language, setLanguage] = useState<Languages>('python');
  const dispatch = useDispatch();
  const [userAlgorithm, setUserAlgorithm] = useState<
    Pick<Algorithm, 'code' | 'description' | 'title' | 'type' | 'language'>
  >({
    code: languageSnippets[language],
    description: '',
    title: '',
    type: AlgoType.Visualizer,
    language,
  });

  const { toast } = useToast();
  const isGodMode = useIsGodMode();
  const [autoSelectAll, setAutoSelectAll] = useState(!isGodMode);

  const { codeMutation, getAdjacenyList } = useCodeMutation((error) => {
    if (error instanceof AxiosError) {
      return toast({
        title: 'Error',
        description: error.message,
      });
    }
    const data = JSON.stringify(error);

    toast({
      title: 'Error',
      description: data,
    });
  });
  const [tabValue, setTabValue] = useState<'output' | 'input'>('input');

  const meta = useMeta();

  useEffect(() => {
    // #TODO need to do zod validation
    if (!data) return;
    const circles = data.circles as CircleReceiver[] | undefined;
    const lines = data.lines as Edge[] | undefined;
    if (circles && circles.length > 0) {
      dispatch(CanvasActions.setCircles(circles));
    }
    if (lines && lines.length > 0) {
      dispatch(CanvasActions.setLines(lines));
    }

    dispatch(
      CollaborationActions.setPlaygroundOwner({ owner: data.userId }, meta)
    );
    () => {
      dispatch(CollaborationActions.clearOwner()), meta;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      dispatch(CollaborationActions.cleanupCollabInfo());
    },
    [dispatch]
  );

  useEffect(() => {
    // for desktop app custom hoom next commit
    const rx = /INPUT|SELECT|TEXTAREA/i;

    const keyDownHandler = (e: any) => {
      if (e.which === 8) {
        // 8 == backspace
        if (
          !rx.test(e.target.tagName) ||
          e.target.disabled ||
          e.target.readOnly
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keypress', keyDownHandler);

    // cleanup function
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keypress', keyDownHandler);
    };
  }, []);
  return (
    <Resizable
      canvasSize={canvasWidth}
      codeExecSize={codeExecWidth}
      setCanvasSize={setCanvasWidth}
      setCodeExecSize={setCodeExecWidth}
      type="horizontal"
      leftDiv={
        <>
          <Visualize
            selectedValidatorLens={selectedValidatorLens}
            setSelectedValidatorLens={setSelectedValidatorLens}
            canvasWidth={canvasWidth}
            setUserAlgorithm={setUserAlgorithm}
          />
        </>
      }
      rightDiv={
        <div className="w-full h-full border-2 border-secondary">
          <CodeExecutionControlBar
            setTabValue={setTabValue}
            tabValue={tabValue}
            autoSelectAll={autoSelectAll}
            setAutoSelectAll={setAutoSelectAll}
            userAlgorithm={userAlgorithm}
            codeMutation={codeMutation}
            setUserAlgorithm={setUserAlgorithm}
            openLanguageComboBox={openLanguageComboBox}
            setOpenLanguageComboBox={setOpenLanguageComboBox}
            language={language}
            setLanguage={setLanguage}
          />
          <CodeExecution
            adjacencyList={getAdjacenyList(autoSelectAll)}
            setTabValue={setTabValue}
            tabValue={tabValue}
            autoSelectAll={autoSelectAll}
            codeMutation={codeMutation}
            selectedValidatorLens={selectedValidatorLens}
            setSelectedValidatorLens={setSelectedValidatorLens}
            setUserAlgorithm={setUserAlgorithm}
            userAlgorithm={userAlgorithm}
            openLanguageComboBox={openLanguageComboBox}
            setOpenLanguageComboBox={setOpenLanguageComboBox}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      }
    />
  );
};

export default ContentWrapper;
