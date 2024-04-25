import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { observable } from "onek";
import { useObserver } from "onek/react";

import { createDragSource, createDropTarget } from "snapdrag";

const [dragElement, setDragElement] = observable(null);
const [dragElementPosition, setDragElementPosition] = observable({
  top: 0,
  left: 0,
});

export function Overlay({ style = {}, className = "" }) {
  const observer = useObserver();

  return observer(() => {
    const { top, left } = dragElementPosition();

    const dragWrapperStyle = {
      position: "relative",
      transform: `translateX(${left}px) translateY(${top}px)`,
    };

    const dragOverlayStyle = {
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      ...style,
    };

    return dragElement() ? (
      <div className={className} style={dragOverlayStyle}>
        <div className="dragWrapper" style={dragWrapperStyle}>
          {dragElement()}
        </div>
      </div>
    ) : null;
  });
}

export function useDraggable(config) {
  const [isDragging, setIsDragging] = useState(false);

  const dragElementRef = useRef(null);
  const dragElementBeforeStartRef = useRef(null);

  const trueConfig = useMemo(
    () => ({
      ...config,
      onDragStart(props) {
        dragElementBeforeStartRef.current = dragElementRef.current;

        setIsDragging(true);

        config.onDragStart?.(props);
      },
      onDragMove(props) {
        const top = props.event.pageY - props.dragStartEvent.offsetY;
        const left = props.event.pageX - props.dragStartEvent.offsetX;

        setDragElementPosition({ top, left });

        config.onDragMove?.(props);
      },
      onDragEnd(props) {
        dragElementBeforeStartRef.current = null;

        setIsDragging(false);
        setDragElementPosition({ top: 0, left: 0 });
        setDragElement(null);

        config.onDragEnd?.(props);
      },
    }),
    [config]
  );

  useEffect(() => {
    if (isDragging) {
      setDragElement(config.component?.({ isDragging }) ?? dragElementRef.current);
    }
  }, [isDragging]);

  const dragSource = useMemo(() => createDragSource(trueConfig), []);

  const dragSourceDestructor = useRef(null);

  useEffect(() => {
    dragSource.setConfig(trueConfig);
  }, [trueConfig]);

  useEffect(() => {
    return () => {
      dragSourceDestructor.current?.();
    };
  }, []);

  const childRef = useCallback((el) => {
    if (el) {
      dragSourceDestructor.current = dragSource.listen(el);
    }
  }, []);

  return {
    draggable(child) {
      dragElementRef.current = child;

      const clone = React.cloneElement(child, { ref: childRef });

      dragElementBeforeStartRef.current ??= clone;

      if (isDragging) {
        setDragElement(child);
      }

      return isDragging && config.move
        ? null
        : config.component || !isDragging
        ? clone
        : dragElementBeforeStartRef.current;
    },
    isDragging,
  };
}

export function useDroppable(config) {
  const trueConfig = useMemo(
    () => ({
      ...config,
      onDragIn(props) {
        config.onDragIn?.({ kind: props.sourceType, data: props.sourceData });
      },
      onDragOut(props) {
        config.onDragOut?.({ kind: props.sourceType, data: props.sourceData });
      },
      onDrop(props) {
        config.onDrop?.(props);
      },
    }),
    [config]
  );

  const dropTarget = useMemo(() => createDropTarget(trueConfig), []);

  const dropTargetDestructor = useRef(null);

  const childRef = useCallback(
    (element) => {
      // if (dropTargetDestructor.current) {
      //   dropTargetDestructor.current();
      // }

      if (element) {
        console.log("droptarget listen");
        dropTargetDestructor.current = dropTarget.listen(element);
      }
    },
    [dropTarget]
  );

  useEffect(() => {
    dropTarget.setConfig(trueConfig);
  }, [trueConfig]);

  useEffect(() => {
    return () => {
      dropTargetDestructor.current();
    };
  }, []);

  return {
    droppable(child) {
      return React.cloneElement(child, { ref: childRef });
    },
  };
}
