import { CanvasContext } from '@/context/CanvasContext';
import { useContext } from 'react';

export const useCanvasRef = () => {
  const { canvasRef } = useContext(CanvasContext);
  if (canvasRef === null) {
    throw new Error(
      'Canvas ref not provided default ref value, this needs to be fixed'
    );
  }
  return canvasRef;
};
