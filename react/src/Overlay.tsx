import React, { useState, useEffect, ReactElement } from "react";

const NOOP = () => {};

export let setDragElement: (element: React.ReactElement | null) => void = NOOP;
export let setDragElementPosition: (position: { top: number; left: number }) => void = NOOP;

export function Overlay({ style = {}, className = "" }) {
  const [dragElement, _setDragElement] = useState<React.ReactElement | null>(null);
  const [dragElementPosition, _setDragElementPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setDragElement = (element: ReactElement | null) => {
      Promise.resolve().then(() => {
        _setDragElement(element);
      });
    };

    setDragElementPosition = (position: { top: number; left: number }) => {
      Promise.resolve().then(() => {
        _setDragElementPosition(position);
      });
    };

    return () => {
      setDragElement = NOOP;
      setDragElementPosition = NOOP;
    };
  }, []);

  const { top, left } = dragElementPosition;

  const dragWrapperStyle = {
    position: "relative" as const,
    transform: `translateX(${left}px) translateY(${top}px)`,
  };

  const dragOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    ...style,
  };

  return dragElement ? (
    <div style={dragOverlayStyle} className={className}>
      <div style={dragWrapperStyle}>{dragElement}</div>
    </div>
  ) : null;
}
