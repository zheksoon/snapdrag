import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";

import {
  DragSourceConfig,
  DragSourceType,
  DropTargetConfig,
  IDropTarget,
  createDragSource,
  createDropTarget,
} from "snapdrag";

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

type Kind = string | symbol;

type DraggableConfig = {
  component?: () => React.ReactElement;
  kind: Kind;
  data: any;
  shouldDrag?: (args: { event: MouseEvent; element: HTMLElement }) => boolean;
  onDragStart?: (args: { event: MouseEvent; element: HTMLElement; data: any }) => void;
  onDragMove?: (args: {
    event: MouseEvent;
    dropTargets: IDropTarget<any>[];
    data: any;
    top: number;
    left: number;
  }) => void;
  onDragEnd?: (args: { event: MouseEvent; data: any; dropTargets: IDropTarget<any>[] }) => void;
  move?: boolean;
  disabled?: boolean;
  mouseConfig?: any;
  plugins?: any;
};

export function useDraggable(config: DraggableConfig) {
  const [isDragging, setIsDragging] = useState(false);

  const refs = useRef({
    dragComponentSnapshot: null,
    element: null,
    elementOffset: { top: 0, left: 0 },
    originalRef: null,
    component: null,
    isDragging: false,
  });

  refs.current.component = config.component;

  const shouldDrag = (props) => {
    const shouldDrag = config.shouldDrag?.({
      event: props.dragStartEvent,
      element: props.dragElement,
    });
    return shouldDrag;
  };

  const trueConfig: DragSourceConfig<any> = {
    disabled: config.disabled,
    type: config.kind,
    data: config.data,
    shouldDrag: config.shouldDrag && shouldDrag,
    onDragStart(props) {
      const current = refs.current;

      const { top, left } = current.element.getBoundingClientRect();

      current.elementOffset = {
        top: top - props.dragStartEvent.pageY,
        left: left - props.dragStartEvent.pageX,
      };

      current.isDragging = true;

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
      const current = refs.current;

      current.dragComponentSnapshot = null;

      current.isDragging = false;

      current.elementOffset = { top: 0, left: 0 };

      setIsDragging(false);

      setDragElementPosition({ top: 0, left: 0 });

      setDragElement(null);

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

  const componentRef = useCallback(
    (element) => {
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
    },
    [dragSource]
  );

  const dragComponentRef = useCallback(
    (element) => {
      if (element) {
        dragSource.listen(element);
      }
    },
    [dragSource]
  );

  const draggable = useCallback(
    (child) => {
      if (!child) {
        return null;
      }

      const current = refs.current;

      current.originalRef = child.ref;

      const clone = React.cloneElement(child, { ref: componentRef });

      current.dragComponentSnapshot ??= clone;

      if (current.isDragging) {
        let dragComponent = current.component?.() ?? child;

        dragComponent = React.cloneElement(dragComponent, { ref: dragComponentRef });

        setDragElement(dragComponent);

        if (config.move) {
          return null;
        }

        return current.dragComponentSnapshot;
      }

      return clone;
    },
    [componentRef, dragComponentRef]
  );

  return {
    draggable,
    isDragging,
  };
}

export type DroppableConfig = {
  accepts: Kind | Kind[] | ((props: { kind: string; data: any }) => boolean);
  data?: any;
  onDragIn?: (props: { kind: string; data: any; event: MouseEvent }) => void;
  onDragOut?: (props: { kind: string; data: any; event: MouseEvent }) => void;
  onDragMove?: (props: { kind: string; data: any; event: MouseEvent }) => void;
  onDrop?: (props: { kind: string; data: any; dropTargets: IDropTarget<any>[] }) => void;
};

type HoveredData = {
  kind: Kind,
  data: any,
  element: HTMLElement,
}

export function useDroppable(config: DroppableConfig) {
  const [hovered, setHovered] = useState<HoveredData | null>(null);

  let { accepts } = config;

  const trueAccepts = Array.isArray(accepts) || typeof accepts === "function" ? accepts : [accepts];

  const trueConfig: DropTargetConfig<any> = {
    sourceTypes: trueAccepts as unknown as DragSourceType<any>[],
    data: config.data,
    onDragIn(props) {
      setHovered({ kind: props.sourceType, data: props.sourceData, element: props.dragElement });

      config.onDragIn?.({ kind: props.sourceType, data: props.sourceData, event: props.event });
    },
    onDragOut(props) {
      setHovered(null);

      config.onDragOut?.({ kind: props.sourceType, data: props.sourceData, event: props.event });
    },
    onDragMove(props) {
      config.onDragMove?.({ kind: props.sourceType, data: props.sourceData, event: props.event });
    },
    onDrop(props) {
      setHovered(null);

      config.onDrop?.({
        kind: props.sourceType,
        data: props.sourceData,
        dropTargets: [...props.dropTargets.values()],
      });
    },
  };

  const dropTarget = useMemo(() => createDropTarget(trueConfig), []);

  dropTarget.setConfig(trueConfig);

  const originalRef = useRef(null);

  const dropComponentRef = useCallback((element) => {
    if (element) {
      dropTarget.listen(element);
    }

    const ref = originalRef.current;

    if (typeof ref === "function") {
      ref(element);
    } else if (ref && ref.hasOwnProperty("current")) {
      ref.current = element;
    }
  }, []);

  const droppable = useCallback((child) => {
    if (!child) {
      return null;
    }

    originalRef.current = child.ref;

    return React.cloneElement(child, { ref: dropComponentRef });
  }, []);

  return {
    droppable,
    hovered,
  };
}
