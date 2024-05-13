import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";

import { DragSourceConfig, DropTargetConfig, createDragSource, createDropTarget } from "snapdrag";

let setDragElementFn = null;
let setDragElementPositionFn = null;

const setDragElement = (element) => {
  Promise.resolve().then(() => {
    setDragElementFn?.(element);
  });
};

const setDragElementPosition = (position) => {
  Promise.resolve().then(() => {
    setDragElementPositionFn?.(position);
  });
};

let mouseConfig = null;

export function setMouseConfig(config) {
  mouseConfig = config;
}

export function Overlay({ style = {}, className = "" }) {
  const [dragElement, _setDragElement] = useState(null);
  const [dragElementPosition, _setDragElementPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setDragElementFn = _setDragElement;
    setDragElementPositionFn = _setDragElementPosition;

    return () => {
      setDragElementFn = null;
      setDragElementPositionFn = null;
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
    <div style={dragOverlayStyle}>
      <div style={dragWrapperStyle}>{dragElement}</div>
    </div>
  ) : null;
}

export function useDraggable(config: any) {
  const [isDragging, setIsDragging] = useState(false);

  const refs = useRef({
    dragComponentSnapshot: null,
    element: null,
    elementOffset: { top: 0, left: 0 },
    originalRef: null,
    component: null,
  });

  refs.current.component = config.component;

  const trueConfig = {
    disabled: config.disabled,
    type: config.kind,
    data: config.data,
    shouldDrag(props) {
      const shouldDrag = config.shouldDrag?.({
        event: props.dragStartEvent,
        element: props.dragElement,
      });
      return shouldDrag;
    },
    onDragStart(props) {
      const { top, left } = refs.current.element.getBoundingClientRect();

      refs.current.elementOffset = {
        top: top - props.dragStartEvent.pageY,
        left: left - props.dragStartEvent.pageX,
      };
      
      setIsDragging(true);

      config.onDragStart?.({
        element: props.dragElement,
        event: props.dragStartEvent,
        data: props.data,
      });
    },
    onDragMove(props) {
      const top = refs.current.elementOffset.top + props.event.pageY;
      const left = refs.current.elementOffset.left + props.event.pageX;

      setDragElementPosition({ top, left });

      const dropTargets = [...props.dropTargets.values()];

      config.onDragMove?.({ event: props.event, dropTargets, data: props.data, top, left });
    },
    onDragEnd(props) {
      refs.current.dragComponentSnapshot = null;

      setIsDragging(false);

      setDragElementPosition({ top: 0, left: 0 });

      setDragElement(null);

      refs.current.elementOffset = { top: 0, left: 0 };

      const dropTargets = [...props.dropTargets.values()];

      config.onDragEnd?.({
        event: props.event,
        data: props.data,
        dropTargets,
      });
    },
    mouseConfig: config.mouseConfig ?? mouseConfig,
    plugins: config.plugins,
  };

  const dragSource = useMemo(() => createDragSource(trueConfig), []);

  dragSource.setConfig(trueConfig);

  const componentRef = useCallback((element) => {
    const current = refs.current;

    if (element) {
      current.element = element;

      dragSource.listen(element);
    }

    const ref = current.originalRef;

    if (typeof ref === "function") {
      ref(element);
    } else if (ref && ref.hasOwnProperty("current")) {
      ref.current = element;
    }
  }, []);

  const dragComponentRef = useCallback((element) => {
    if (element) {
      dragSource.listen(element);
    }
  }, []);

  const draggable = useCallback((child) => {
    const current = refs.current;

    current.originalRef = child.ref;

    const clone = React.cloneElement(child, { ref: componentRef });

    current.dragComponentSnapshot ??= clone;

    if (isDragging) {
      let dragComponent = current.component?.() ?? child;

      dragComponent = React.cloneElement(dragComponent, { ref: dragComponentRef });

      setDragElement(dragComponent);

      if (config.move) {
        return null;
      }

      return current.dragComponentSnapshot;
    }

    return clone;
  }, []);

  return {
    draggable,
    isDragging,
  };
}

export function useDroppable(config) {
  const [hoveredBy, setHoveredBy] = useState(null);

  const dropTargetElementRef = useRef(null);

  const dropTargetDestructor = useRef(null);

  const trueConfig = useMemo<DropTargetConfig<any>>(
    () => ({
      sourceTypes: config.accepts,
      data: config.data,
      onDragIn(props) {
        setHoveredBy({ kind: props.sourceType, data: props.sourceData });

        config.onDragIn?.({ kind: props.sourceType, data: props.sourceData, event: props.event });
      },
      onDragOut(props) {
        setHoveredBy(null);

        config.onDragOut?.({ kind: props.sourceType, data: props.sourceData, event: props.event });
      },
      onDragMove(props) {
        config.onDragMove?.({ kind: props.sourceType, data: props.sourceData, event: props.event });
      },
      onDrop(props) {
        setHoveredBy(null);

        config.onDrop?.({
          kind: props.sourceType,
          data: props.sourceData,
          dropTargets: [...props.dropTargets.values()],
        });
      },
    }),
    [config]
  );

  const dropTarget = useMemo(() => createDropTarget(trueConfig), []);

  const originalRef = useRef(null);

  const childRef = useCallback(
    (element) => {
      if (element) {
        dropTarget.listen(element);
      }

      const ref = originalRef.current;

      if (typeof ref === "function") {
        ref(element);
      } else if (ref && ref.hasOwnProperty("current")) {
        ref.current = element;
      }
    },
    [dropTarget]
  );

  useEffect(() => {
    dropTarget.setConfig(trueConfig);
  }, [trueConfig]);

  return {
    droppable(child) {
      if (!child) {
        return null;
      }

      originalRef.current = child.ref;

      return React.cloneElement(child, { ref: childRef });
    },
    hoveredBy,
  };
}
