import React, { useState, useEffect, ReactElement, useRef } from "react";

const NOOP = () => {};

export let setDragElement: (element: ReactElement | null) => void = NOOP;
export let setDragElementPosition: (position: { top: number; left: number }) => void = NOOP;

export function Overlay({ style = {}, className = "" }) {
  const [dragElement, _setDragElement] = useState<ReactElement | null>(null);
  const dragWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDragElement = (element: ReactElement | null) => {
      _setDragElement(element);
    };

    setDragElementPosition = (position: { top: number; left: number }) => {
      const { current } = dragWrapperRef;

      if (!current) return;

      current.style.transform = `
        translateX(${position.left}px) translateY(${position.top}px)
      `;
    };

    return () => {
      setDragElement = NOOP;
      setDragElementPosition = NOOP;
    };
  }, []);

  const dragWrapperStyle = {
    position: "relative" as const,
    transform: `translateX(0px) translateY(0px)`,
    willChange: "transform",
  };

  const dragOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: dragElement ? "block" : "none",
    ...style,
  };

  return (
    <div style={dragOverlayStyle} className={className}>
      <div ref={dragWrapperRef} style={dragWrapperStyle}>
        {dragElement}
      </div>
    </div>
  );
}
