import {
  CanvasControlBarActions,
  UndirectedEdge,
  DirectedEdge,
  CircleReceiver,
} from '@/lib/types';
import { CanvasActions, ValidatorLensInfo } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useMeta } from './useMeta';
import { useShapeUpdateMutation } from './useShapeUpdateMutation';
import { useSearchParams } from 'next/navigation';

export const useAddGeometry = () => {
  const {
    circles,
    currentZoomFactor: creationZoomFactor,
    attachableLines,
    cameraCoordinate,
  } = useAppSelector((store) => store.canvas.present);
  const dispatch = useAppDispatch();
  const meta = useMeta();
  const shapeUpdateMutation = useShapeUpdateMutation();
  const searchParams = useSearchParams();

  const validShapeUpdateMutation = (
    ...args: Parameters<typeof shapeUpdateMutation.mutate>
  ) => searchParams.get('playground-id') && shapeUpdateMutation.mutate(...args);

  const handleAddUndirectedEdge = () => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.UndirectedEdge,
          type: 'canvas-action',
        },
        meta
      )
    );
    const [x1, y1] = [
      creationZoomFactor * Math.random() * 400 - cameraCoordinate[0],
      creationZoomFactor * Math.random() * 400 - cameraCoordinate[1],
    ];
    const newLine: UndirectedEdge = {
      id: crypto.randomUUID(),

      type: 'rect',
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 4 * creationZoomFactor,
      directed: false,
      color: '#ACACAC',
      attachNodeOne: {
        center: [x1, y1],
        radius: 15 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 15 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };
    validShapeUpdateMutation({
      lines: [...attachableLines, newLine],
      zoomAmount: creationZoomFactor,
    });
    // if (playgroundID) {
    //   Utils.sendCreate(
    //     {
    //       roomID: playgroundID,
    //       type: 'edge',
    //       state: newLine,
    //     },
    //     socketRef
    //   );
    // }
    dispatch(CanvasActions.addLine(newLine, meta));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  const handleAddDirectedEdge = () => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.DirectedEdge,
          type: 'canvas-action',
        },
        meta
      )
    );
    const [x1, y1] = [
      Math.random() * 400 * creationZoomFactor - cameraCoordinate[0],
      Math.random() * 600 * creationZoomFactor - cameraCoordinate[1],
    ];
    const newLine: DirectedEdge = {
      // gotta change this iz so weird
      id: crypto.randomUUID(),
      type: 'rect',
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 7 * creationZoomFactor,
      directed: true,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 10 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 10 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };

    dispatch(CanvasActions.addLine(newLine, meta));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  const handleAddCircle = () => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.Node,
          type: 'canvas-action',
        },
        meta
      )
    );
    const circleCenter: [number, number] = [
      Math.random() * 400 * creationZoomFactor - cameraCoordinate[0],
      Math.random() * 400 * creationZoomFactor - cameraCoordinate[1],
    ];
    const circleRadius = 50;
    const newNodeConnector: CircleReceiver['nodeReceiver'] = {
      id: crypto.randomUUID(),
      center: circleCenter,
      radius: circleRadius * 0.4 * creationZoomFactor,
      color: '#262D3F',
      type: 'circle',
      attachedIds: [],
    };
    const newCircle: CircleReceiver = {
      id: crypto.randomUUID(),
      algorithmMetadata: {
        active: false,
      },
      value: Math.floor(Math.random() * 100),
      type: 'circle',
      center: circleCenter,
      radius: circleRadius * creationZoomFactor,
      color: 'rgb(24, 30, 43, .85)',
      nodeReceiver: newNodeConnector,
    };

    validShapeUpdateMutation({
      circles: [...circles, newCircle],
      zoomAmount: creationZoomFactor,
    });

    dispatch(CanvasActions.addCircle(newCircle, meta));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  const handleAddValidatorLens = (id: string) => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.Validators,
          type: 'canvas-action',
        },
        meta
      )
    );
    const newValidatorLens: ValidatorLensInfo = {
      id: crypto.randomUUID(),
      algoId: id,
      result: null,
      code: null,
      rect: {
        bottomRight: [
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[0],
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[1],
        ],
        topLeft: [
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[0],
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[1],
        ],
      },
      selectedIds: [],
      type: 'validator-lens',
    };
    dispatch(CanvasActions.addValidatorLens(newValidatorLens));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  return {
    handleAddCircle,
    handleAddDirectedEdge,
    handleAddUndirectedEdge,
    handleAddValidatorLens,
  };
};
