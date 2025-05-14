import { DROPPABLE_ATTRIBUTE, DROPPABLE_FORCE_ATTRIBUTE } from "@snapdrag/core";
import React, { ReactElement, useEffect, useRef, useState } from "react";

const NOOP = () => {};

export let setOverlayVisible: (visible: boolean) => void = NOOP;
export let setDragElementPosition: (position: { top: number; left: number }) => void = NOOP;

export const OVERLAY_ID = "$snapdrag-overlay";

export function Overlay({ style = {}, className = "" }) {
  const dragOverlayRef = useRef<HTMLDivElement>(null);
  const dragWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOverlayVisible = (visible: boolean) => {
      const dragOverlay = dragOverlayRef.current;

      if (!dragOverlay) return;

      dragOverlay.style.display = visible ? "block" : "none";

      const dragWrapper = dragWrapperRef.current;

      if (!dragWrapper) return;

      // force the drag wrapper to be not droppable, so it will not interfere with real drop event
      // self-drop doesn't make sense
      if (visible) {
        dragWrapper.setAttribute(DROPPABLE_FORCE_ATTRIBUTE, "false");
      } else {
        dragWrapper.removeAttribute(DROPPABLE_FORCE_ATTRIBUTE);
      }
    };

    setDragElementPosition = (position: { top: number; left: number }) => {
      const { current } = dragWrapperRef;

      if (!current) return;

      current.style.transform = `translateX(${position.left}px) translateY(${position.top}px)`;
    };

    return () => {
      setDragElementPosition = NOOP;
      setOverlayVisible = NOOP;
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
    display: "none",
    ...style,
  };

  return (
    <div ref={dragOverlayRef} style={dragOverlayStyle} className={className}>
      <div id={OVERLAY_ID} ref={dragWrapperRef} style={dragWrapperStyle}></div>
    </div>
  );
}
