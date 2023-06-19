import React, { useState, useRef } from 'react';

const ResizableDiv: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(200);
  const divRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // When the user presses the mouse button, start dragging
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    // When the user releases the mouse button, stop dragging
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    // If not dragging, return early
    if (!isDragging) return;

    // Calculate the new width
    if (divRef.current) {
      const newWidth = e.clientX - divRef.current.getBoundingClientRect().left;

      // Update the width
      setWidth(newWidth);
    }
  };

  React.useEffect(() => {
    // Add the event listeners
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    // Remove the event listeners when the component is unmounted
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  return (
    <div
      className="bg-white"
      ref={divRef}
      onMouseDown={handleMouseDown}
      style={{
        width: `${width}px`,
        height: '100%',
        border: '1px solid black',

        cursor: 'col-resize',
      }}
    >
      Resizable Div
    </div>
  );
};

export default ResizableDiv;
