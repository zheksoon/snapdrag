import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { observable } from "onek";
import { useObserver } from "onek/react";

import { DragSourceConfig, DropTargetConfig, createDragSource, createDropTarget } from "snapdrag";

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

    return dragElement() ? (
      <div style={dragOverlayStyle}>
        <div style={dragWrapperStyle}>{dragElement()}</div>
      </div>
    ) : null;
  });
}

export function useDraggable(config: any) {
  const [isDragging, setIsDragging] = useState(false);

  const dragElementSnapshotRef = useRef(null);

  const elementRef = useRef(null);

  const elementOffsetRef = useRef({ top: 0, left: 0 });

  const trueConfig = useMemo<DragSourceConfig<any>>(
    () => ({
      type: config.kind,
      data: config.data,
      onDragStart(props) {
        const { top, left } = elementRef.current.getBoundingClientRect();

        elementOffsetRef.current = {
          top: top - props.dragStartEvent.pageY,
          left: left - props.dragStartEvent.pageX,
        };

        setIsDragging(true);

        config.onDragStart?.({ event: props.dragStartEvent });
      },
      onDragMove(props) {
        const top = elementOffsetRef.current.top + props.event.pageY;
        const left = elementOffsetRef.current.left + props.event.pageX;

        setDragElementPosition({ top, left });

        config.onDragMove?.({ event: props.event, top, left });
      },
      onDragEnd(props) {
        dragElementSnapshotRef.current = null;

        setIsDragging(false);

        setDragElementPosition({ top: 0, left: 0 });

        setDragElement(null);

        elementOffsetRef.current = { top: 0, left: 0 };

        const dropTargets = [...props.dropTargets.values()];

        config.onDragEnd?.({ event: props.event, dropTargets });
      },
    }),
    [config]
  );

  const dragSource = useMemo(() => createDragSource(trueConfig), []);

  useEffect(() => {
    dragSource.setConfig(trueConfig);
  }, [trueConfig]);

  const originalRef = useRef(null);

  const childRef = useCallback((element) => {
    if (element) {
      elementRef.current = element;

      dragSource.listen(element);
    }

    const ref = originalRef.current;

    if (typeof ref === "function") {
      ref(element);
    } else if (ref && ref.hasOwnProperty("current")) {
      ref.current = element;
    }
  }, []);

  const draggingChildRef = useCallback((element) => {
    if (element) {
      dragSource.listen(element);
    }
  }, []);

  return {
    draggable(child) {
      originalRef.current = child.ref;

      const clone = React.cloneElement(child, { ref: childRef });

      dragElementSnapshotRef.current ??= clone;

      if (isDragging) {
        const component = config.component?.() ?? child;

        const withRef = React.cloneElement(component, { ref: draggingChildRef });

        setDragElement(withRef);

        if (config.move) {
          return null;
        }

        return dragElementSnapshotRef.current;
      }

      return clone;
    },
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
        dropTargetElementRef.current = element;

        dropTargetDestructor.current = dropTarget.listen(element);
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

  useEffect(() => {
    dropTargetDestructor.current = dropTarget.listen(dropTargetElementRef.current);

    return () => {
      dropTargetDestructor.current();
    };
  }, []);

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
