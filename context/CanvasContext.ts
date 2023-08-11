import { ElementRef, RefObject, createContext, useRef } from 'react';

type State = {
  canvasRef: RefObject<ElementRef<'canvas'>> | null;
};

export const CanvasContext = createContext<State>({
  canvasRef: null,
});
