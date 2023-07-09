import {
  AlgorithmMetadata,
  DirectedEdge,
  Edge,
  SelectedGeometryInfo,
  Prettify,
  CircleReceiver,
  FirstParameter,
  PencilCoordinates,
} from '@/lib/types';
import { enableMapSet } from 'immer';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as Canvas from '@/lib/Canvas/canvas';
import * as Draw from '@/lib/Canvas/draw';
import { ImmutableQueue } from '@/lib/graph';
import { withMeta } from '../store';
import { match } from 'ts-pattern';

// this validatorLens will have code attached to it
// it should probably extend the selectedGeomotryInfo
// I do think it could extend the selected geomotry infi
// but if we had a custom code shader
// we would still need to take in the selections (lets not duplicate state)
// but would we? Yes because we would need the representation to traverse and validate
// we can have extra logic where the select box is considered a shader
// if a pixel is hovered over an area, it changes the color
// this can just be a low opacity translation
// but we would need th color of the node to fundamentally change (needs to be red in that area)
export type Shift = { shift: [number, number] };
export type ValidatorLensInfo = {
  id: string;
  algoId: string;
  rect: {
    topLeft: [number, number];
    bottomRight: [number, number];
  };
  code: string | null;
  selectedIds: string[];
  type: 'validator-lens';
};

export type CanvasState = {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  selectedGeometryInfo: SelectedGeometryInfo | null;
  validatorLensContainer: ValidatorLensInfo[];
  creationZoomFactor: number;
  pencilCoordinates: PencilCoordinates;
};

const initialState: CanvasState = {
  attachableLines: [],
  circles: [],
  validatorLensContainer: [],
  creationZoomFactor: 1,
  selectedGeometryInfo: null,
  pencilCoordinates: {
    drawingCoordinates: [],
    drawnCoordinates: [],
  },
};

export type Meta = {
  userID: string;
  playgroundID: string | null;
  fromServer?: boolean;
};

type MetaParams<TPayload> = FirstParameter<
  typeof withMeta<TPayload, CanvasState>
>;

const withCanvasMeta = <TPayload>(args: MetaParams<TPayload>) =>
  withMeta<TPayload, CanvasState>(args);

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    resetState: withCanvasMeta<undefined>(() => initialState),
    deleteAttachableLine: withCanvasMeta<{ id: string }>((state, action) => {
      state.attachableLines = state.attachableLines.filter(
        (line) => line.id !== action.payload.id
      );
    }),
    deleteValidatorLens: withCanvasMeta<{ validatorLensId: string }>(
      (state, action) => {
        state.validatorLensContainer = state.validatorLensContainer.filter(
          (lens) => lens.id !== action.payload.validatorLensId
        );
      }
    ),

    setValidatorLensSelectedIds: withCanvasMeta<{ validatorLensId: string }>(
      (state, action) => {
        const selectedValidatorLens = state.validatorLensContainer.find(
          (lens) => lens.id === action.payload.validatorLensId
        );
        if (!selectedValidatorLens?.selectedIds) return;
        // selectedValidatorLens.selectedIds
        const selectedGeometry = Canvas.getSelectedGeometry({
          edges: state.attachableLines,
          vertices: state.circles,
          selectBox: {
            p1: selectedValidatorLens?.rect.bottomRight,
            p2: selectedValidatorLens?.rect.topLeft,
            type: 'selectBox',
          },
        });
        if (!selectedGeometry) return;
        selectedValidatorLens.selectedIds = selectedGeometry.selectedIds;
      }
    ),
    staticLensSetValidatorLensIds: withCanvasMeta<undefined>((state) => {
      state.validatorLensContainer = state.validatorLensContainer.map(
        (lens) => {
          const selectedGeometry = Canvas.getSelectedGeometry({
            edges: state.attachableLines,
            vertices: state.circles,
            selectBox: {
              p1: lens?.rect.bottomRight,
              p2: lens?.rect.topLeft,
              type: 'selectBox',
            },
          });
          if (!selectedGeometry) {
            return lens;
          }
          return { ...lens, selectedIds: selectedGeometry.selectedIds };
        }
      );
    }),
    panPencilCoordinates: withCanvasMeta<{ pan: [number, number] }>(
      (state, action) => {
        state.pencilCoordinates.drawingCoordinates =
          state.pencilCoordinates.drawingCoordinates.map((cord) => [
            cord[0] - action.payload.pan[0],
            cord[1] - action.payload.pan[1],
          ]);
        state.pencilCoordinates.drawnCoordinates =
          state.pencilCoordinates.drawnCoordinates.map((continuousCords) =>
            continuousCords.map((cord) => [
              cord[0] - action.payload.pan[0],
              cord[1] - action.payload.pan[1],
            ])
          );
      }
    ),
    zoomPencilCoordinates: withCanvasMeta<{
      center: [number, number];
      zoomAmount: number;
    }>((state, action) => {
      state.pencilCoordinates.drawingCoordinates =
        state.pencilCoordinates.drawingCoordinates.map((cords) =>
          Draw.mouseCenteredZoom(
            cords,
            action.payload.center,
            action.payload.zoomAmount
          )
        );
      state.pencilCoordinates.drawnCoordinates =
        state.pencilCoordinates.drawnCoordinates.map((continuousCords) =>
          continuousCords.map((cords) =>
            Draw.mouseCenteredZoom(
              cords,
              action.payload.center,
              action.payload.zoomAmount
            )
          )
        );
    }),
    setPencilDrawnCoordinates: withCanvasMeta<undefined>((state) => {
      state.pencilCoordinates.drawnCoordinates = [
        ...state.pencilCoordinates.drawnCoordinates,
        state.pencilCoordinates.drawingCoordinates,
      ];
    }),
    setPencilDrawingCoordinates: withCanvasMeta<[number, number]>(
      (state, action) => {
        state.pencilCoordinates.drawingCoordinates = [
          ...state.pencilCoordinates.drawingCoordinates,
          action.payload,
        ];
      }
    ),
    resizeValidatorLens: withCanvasMeta<{
      lens: ValidatorLensInfo;
      side: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
      mousePos: [number, number];
    }>((state, action) => {
      const lens = state.validatorLensContainer.find(
        (lens) => lens.id === action.payload.lens.id
      );
      if (!lens) return;
      // state.validatorLensContainer[lensIndex].rect.bottomRight
      match(action.payload.side)
        .with('bottom-left', () => {
          // its just adjusting the bottomRights y
          // adjusting the topLefts x
          const newBottomRight: [number, number] = [
            lens.rect.bottomRight[0],
            action.payload.mousePos[1],
          ];
          const newTopLeft: [number, number] = [
            action.payload.mousePos[0],
            lens.rect.topLeft[1],
          ];

          lens.rect.bottomRight = newBottomRight;
          lens.rect.topLeft = newTopLeft;
        })
        .with('bottom-right', () => {
          lens.rect.bottomRight = action.payload.mousePos;
        })
        .with('top-left', () => {
          lens.rect.topLeft = action.payload.mousePos;
        })
        .with('top-right', () => {
          const newBottomRight: [number, number] = [
            action.payload.mousePos[0],
            lens.rect.bottomRight[1],
          ];
          const newTopLeft: [number, number] = [
            // action.payload.mousePos[0],
            lens.rect.topLeft[0],
            action.payload.mousePos[1],
          ];

          lens.rect.bottomRight = newBottomRight;
          lens.rect.topLeft = newTopLeft;
        })
        .exhaustive();
    }),
    addValidatorLens: withCanvasMeta<ValidatorLensInfo>((state, action) => {
      state.validatorLensContainer = [
        ...state.validatorLensContainer,
        action.payload,
      ];
    }),
    shiftValidatorLens: withCanvasMeta<Shift & { id: string }>(
      (state, action) => {
        const shift = action.payload.shift;
        const selectedLens = state.validatorLensContainer.find(
          (lens, index) => lens.id === action.payload.id
        );
        if (!selectedLens) return;
        selectedLens.rect.bottomRight = [
          selectedLens.rect.bottomRight[0] - shift[0],
          selectedLens.rect.bottomRight[1] - shift[1],
        ];
        selectedLens.rect.topLeft = [
          selectedLens.rect.topLeft[0] - shift[0],
          selectedLens.rect.topLeft[1] - shift[1],
        ];
      }
    ),
    setValidatorLensContainer: withCanvasMeta<ValidatorLensInfo[]>(
      (state, action) => {
        state.validatorLensContainer = action.payload;
      }
    ),
    zoomValidatorLens: withCanvasMeta<{
      zoomAmount: number;
      center: [number, number];
    }>((state, action) => {
      state.validatorLensContainer.forEach((lens, index) => {
        state.validatorLensContainer[index].rect.bottomRight =
          Draw.mouseCenteredZoom(
            lens.rect.bottomRight,
            action.payload.center,
            action.payload.zoomAmount
          );
        state.validatorLensContainer[index].rect.topLeft =
          Draw.mouseCenteredZoom(
            lens.rect.topLeft,
            action.payload.center,
            action.payload.zoomAmount
          );
      });
    }),
    setLines: withCanvasMeta<Edge[]>((state, action) => {
      action.meta?.playgroundID;
      state.attachableLines = action.payload;
    }),
    resetLines: withCanvasMeta<undefined>((state) => {
      state.attachableLines = [];
    }),
    resetCircles: withCanvasMeta<undefined>((state) => {
      state.circles = [];
    }),
    updateCreationZoomFactor: (state, action: PayloadAction<number>) => {
      state.creationZoomFactor *= action.payload;
    },
    deleteCircle: withCanvasMeta<string>(
      (state, action: PayloadAction<string>) => {
        state.circles = state.circles.filter(
          (circle) => circle.id !== action.payload
        );
      }
    ),
    setCircles: withCanvasMeta<CircleReceiver[]>(
      (state, action: PayloadAction<CircleReceiver[]>) => {
        state.circles = action.payload;
      }
    ),

    replaceCircle: withCanvasMeta<CircleReceiver>(
      (state, action: PayloadAction<CircleReceiver>) => {
        state.circles = Canvas.replaceCanvasElement({
          oldArray: state.circles,
          newElement: action.payload,
        });
      }
    ),
    attachNodeToReciever: withCanvasMeta<{
      circleId: string;
      attachId: string;
    }>(
      (
        state,
        action: PayloadAction<{ circleId: string; attachId: string }>
      ) => {
        state.circles
          .find((circle) => circle.id === action.payload.circleId)
          ?.nodeReceiver.attachedIds.push(action.payload.attachId);
      }
    ),
    replaceAttachableLine: withCanvasMeta<Edge>((state, action) => {
      state.attachableLines = Canvas.replaceCanvasElement({
        oldArray: state.attachableLines,
        newElement: action.payload,
      });
    }),
    addLine: withCanvasMeta<Edge>((state, action: PayloadAction<Edge>) => {
      state.attachableLines = [...state.attachableLines, action.payload];
    }),
    addCircle: withCanvasMeta<CircleReceiver>(
      (state, action: PayloadAction<CircleReceiver>) => {
        state.circles = [...state.circles, action.payload];
      }
    ),

    deleteCircles: withCanvasMeta<string[]>(
      (state, action: PayloadAction<string[]>) => {
        const idSet = new Set<string>(action.payload);
        const filtered = state.circles.filter(
          (circle) => !idSet.has(circle.id)
        );

        state.attachableLines.forEach((line) => {
          if (
            line.attachNodeOne.connectedToId &&
            idSet.has(line.attachNodeOne.connectedToId)
          ) {
            line.attachNodeOne = {
              ...line.attachNodeOne,
              connectedToId: null,
            };
          }

          if (
            line.attachNodeTwo.connectedToId &&
            idSet.has(line.attachNodeTwo.connectedToId)
          ) {
            line.attachNodeTwo = {
              ...line.attachNodeTwo,
              connectedToId: null,
            };
          }
        });

        state.circles = filtered;
      }
    ),

    deleteLines: withCanvasMeta<string[]>(
      (state, action: PayloadAction<string[]>) => {
        const filtered = state.attachableLines.filter(
          (line) => !action.payload.includes(line.id)
        );
        const idSet = new Set<string>(action.payload);

        state.circles.forEach((circle) => {
          circle.nodeReceiver.attachedIds =
            circle.nodeReceiver.attachedIds.filter((id) => !idSet.has(id));
        });

        state.attachableLines = filtered;
      }
    ),
    shiftCircles: withCanvasMeta<{
      selectedGeometryInfo: SelectedGeometryInfo;
      shift: [number, number];
    }>((state, action) => {
      const updatedCircles: CircleReceiver[] = state.circles.map((circle) => {
        const { selectedGeometryInfo, shift } = action.payload;
        const shiftedCircle = Canvas.shiftCircle({ circle, shift });
        if (selectedGeometryInfo.selectedIds.includes(circle.id)) {
          return {
            ...shiftedCircle,
            nodeReceiver: {
              ...shiftedCircle.nodeReceiver,
              attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                selectedGeometryInfo.selectedIds.includes(id)
              ),
            },
          };
        } else {
          return {
            ...circle,
            nodeReceiver: {
              ...circle.nodeReceiver,
              attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                selectedGeometryInfo.selectedIds.includes(id)
              ),
            },
          };
        }
      });

      state.circles = updatedCircles;
    }),

    nullifySelectedGeometryInfo: withCanvasMeta<undefined>((state) => {
      state.selectedGeometryInfo = null;
    }),

    shiftLines: withCanvasMeta<Shift>((state, action) => {
      const selectedGeometryInfo = state.selectedGeometryInfo;
      if (selectedGeometryInfo) {
        const updatedLines: Edge[] = state.attachableLines.map((line) => {
          if (
            selectedGeometryInfo.selectedIds.includes(line.id) ||
            selectedGeometryInfo.selectedIds.includes(line.attachNodeOne.id) ||
            selectedGeometryInfo.selectedIds.includes(line.attachNodeTwo.id)
          ) {
            const nodeOneConnectedToId =
              line.attachNodeOne.connectedToId &&
              selectedGeometryInfo.selectedIds.includes(
                line.attachNodeOne.connectedToId
              )
                ? line.attachNodeOne.connectedToId
                : null;

            const nodeTwoConnectedToId =
              line.attachNodeTwo.connectedToId &&
              selectedGeometryInfo.selectedIds.includes(
                line.attachNodeTwo.connectedToId
              )
                ? line.attachNodeTwo.connectedToId
                : null;
            // need to deduplicate this
            const shiftedLine = Canvas.shiftLine({
              line,
              shift: action.payload.shift,
            });
            const newLine: Edge = {
              ...shiftedLine,
              attachNodeOne: {
                ...shiftedLine.attachNodeOne,
                connectedToId: nodeOneConnectedToId,
              },
              attachNodeTwo: {
                ...shiftedLine.attachNodeTwo,
                connectedToId: nodeTwoConnectedToId,
              },
            };

            return newLine;
          }
          return line;
        });

        state.attachableLines = updatedLines;
      }
    }),

    shiftSelectBox: withCanvasMeta<Shift>(
      (state, action: PayloadAction<Shift>) => {
        if (state.selectedGeometryInfo) {
          state.selectedGeometryInfo = Canvas.shiftSelectBox({
            selectedGeometryInfo: state.selectedGeometryInfo,
            shift: action.payload.shift,
          });
        }
      }
    ),
    // shiftValidatorLens: withCanvasMeta<Shift & { validatorLensId: string }>(
    //   (state, action) => {
    //     state.validatorLensContainer.find((lens, index) => {
    //       if (lens.id === action.payload.validatorLensId) {
    //         state.validatorLensContainer[index] ==
    //           Canvas.shiftValidatorLens({
    //             shift: action.payload.shift,
    //             validatorLens: lens,
    //           });
    //         return true;
    //       }
    //     });
    //   }
    // ),
    shiftValidatorLensContainer: withCanvasMeta<Shift>((state, action) => {
      state.validatorLensContainer.forEach((lens, index) => {
        state.validatorLensContainer[index] = Canvas.shiftValidatorLens({
          shift: action.payload.shift,
          validatorLens: lens,
        });
      });
    }),

    setSelectedGeometryInfo: withCanvasMeta<
      CanvasState['selectedGeometryInfo']
    >((state, action: PayloadAction<CanvasState['selectedGeometryInfo']>) => {
      state.selectedGeometryInfo = action.payload;
    }),
    zoomMaxPoints: (
      state,
      action: PayloadAction<{ center: [number, number]; zoomAmount: number }>
    ) => {
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo.maxPoints.closestToOrigin =
          Draw.mouseCenteredZoom(
            state.selectedGeometryInfo.maxPoints.closestToOrigin,
            action.payload.center,
            action.payload.zoomAmount
          );

        state.selectedGeometryInfo.maxPoints.furthestFromOrigin =
          Draw.mouseCenteredZoom(
            state.selectedGeometryInfo.maxPoints.furthestFromOrigin,
            action.payload.center,
            action.payload.zoomAmount
          );
      }
    },
    panMaxPoints: (state, action: PayloadAction<{ pan: [number, number] }>) => {
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo.maxPoints.closestToOrigin = [
          state.selectedGeometryInfo.maxPoints.closestToOrigin[0] -
            action.payload.pan[0],
          state.selectedGeometryInfo.maxPoints.closestToOrigin[1] -
            action.payload.pan[1],
        ];

        state.selectedGeometryInfo.maxPoints.furthestFromOrigin = [
          state.selectedGeometryInfo.maxPoints.furthestFromOrigin[0] -
            action.payload.pan[0],
          state.selectedGeometryInfo.maxPoints.furthestFromOrigin[1] -
            action.payload.pan[1],
        ];
      }
    },
    mapSelectedIds: withCanvasMeta<(id: string) => string>(
      (state, action: PayloadAction<(id: string) => string>) => {
        const cb = action.payload;
        if (state.selectedGeometryInfo) {
          state.selectedGeometryInfo.selectedIds =
            state.selectedGeometryInfo.selectedIds.map(cb);
        }
      }
    ),
    addSelectedIds: withCanvasMeta<string[]>(
      (state, action: PayloadAction<string[]>) => {
        if (state.selectedGeometryInfo) {
          state.selectedGeometryInfo.selectedIds = [
            ...state.selectedGeometryInfo.selectedIds,
            ...action.payload,
          ];
        }
      }
    ),
  },
});

export const CanvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;
