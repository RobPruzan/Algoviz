'use client';
import { CanvasContext } from '@/context/CanvasContext';
import { ElementRef, useRef } from 'react';

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const canvasRef = useRef<ElementRef<'canvas'> | null>(null);

  return (
    <CanvasContext.Provider value={{ canvasRef }}>
      {children}
    </CanvasContext.Provider>
  );
};
