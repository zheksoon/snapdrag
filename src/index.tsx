import React, { useRef, useState, useEffect, useCallback } from "react";
import { observable } from "onek";
import { useObserver } from "onek/react";

type StartCoords = {
  startMouseX: number;
  startMouseY: number;
  startElementX: number;
  startElementY: number;
  startOffsetX: number;
  startOffsetY: number;
};

type DragComponentProps = {
  event: MouseEvent;
  dropTargets: Set<Element>;
} & StartCoords;

export type DragComponentFn = (
  params: DragComponentProps
) => JSX.Element | JSX.Element[] | null;

type DragSourceSymbol = string | symbol;

export type DragSourceType<Data> = DragSourceSymbol & { __data: Data };

export type DropHandlerProps<T> = T extends DragSourceType<infer Data>
  ? { type: DragSourceSymbol; data: Data; event: MouseEvent }
  : never;

export type DropHandler<T> = (props: DropHandlerProps<T>) => void;

type DropHandlers<T> = {
  data?: any;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};

type DragSourceParams<T> = {
  type: DragSourceType<T>;
  data: T;
  dragComponent: DragComponentFn;
  onDragStart: (
    params: { event: MouseEvent } & StartCoords
  ) => boolean | undefined | void;
  onDragEnd: (
    params: {
      event: MouseEvent;
      dropTargets: Set<Element>;
    } & StartCoords
  ) => void;
  onDragMove: (params: {
    event: MouseEvent;
    dropTargets: Set<Element>;
  }) => void;
};

type DropTargetParams<T> = {
  sourceTypes: Array<T>;
  data?: any;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};

function useMergeRefs(
  refToRef: React.RefObject<any>,
  otherRef: React.MutableRefObject<any>
) {
  return useCallback(
    (element: Element | null) => {
      const ref = refToRef.current;

      if (typeof ref === "function") {
        ref(element);
      } else if (ref && ref.hasOwnProperty("current")) {
        ref.current = element;
      }
      otherRef.current = element;
    },
    [refToRef, otherRef]
  );
}

export function dragSourceType<Data>(
  type: DragSourceSymbol
): DragSourceType<Data> {
  return type as DragSourceType<Data>;
}

export function createDragContext() {
  const [getMouseEvent, setMouseEvent] = observable<MouseEvent | null>(null);

  const dropHandlers = new WeakMap<Element, DropHandlers<any>>();

  let currentDragComponent: DragComponentFn | null = null;
  let startCoords: StartCoords | null = null;
  let dropTargets = new Set<Element>();

  function getDropTargetData(target: Element): any[] {
    const handlers = dropHandlers.get(target);

    return handlers?.data;
  }

  function useDragSource<T>({
    type,
    data: initialData,
    dragComponent,
    onDragStart,
    onDragEnd,
    onDragMove
  }: DragSourceParams<T>) {
    const dragStartTriggered = useRef(false);

    const elementRef = useRef<Element | null>(null);
    const dragComponentRef = useRef<DragComponentFn>(dragComponent);
    const dragStartEventRef = useRef<MouseEvent | null>(null);

    const onDragStartRef = useRef<DragSourceParams<T>["onDragStart"]>(
      onDragStart
    );
    const onDragEndRef = useRef<DragSourceParams<T>["onDragEnd"]>(onDragEnd);
    const onDragMoveRef = useRef<DragSourceParams<T>["onDragMove"]>(onDragMove);
    const dataRef = useRef<T>(initialData);

    dragComponentRef.current = dragComponent;
    onDragStartRef.current = onDragStart;
    onDragEndRef.current = onDragEnd;
    onDragMoveRef.current = onDragMove;

    dataRef.current = initialData;

    if (dragStartTriggered.current) {
      currentDragComponent = dragComponent;
    }

    useEffect(() => {
      const element = elementRef.current;

      if (!element) return;

      const cleanup = () => {
        document.removeEventListener("pointermove", mouseMoveHandler);
        document.removeEventListener("pointerup", mouseUpHandler);

        setMouseEvent(null);

        currentDragComponent = null;
        startCoords = null;

        dragStartEventRef.current = null;
        dragStartTriggered.current = false;

        dropTargets.clear();
      };

      const mouseMoveHandler = (event: MouseEvent) => {
        if (!dragStartTriggered.current) {
          const dragStartEvent = dragStartEventRef.current!;

          const { left, top } = elementRef.current!.getBoundingClientRect();

          startCoords = {
            startMouseX: dragStartEvent.x,
            startMouseY: dragStartEvent.y,
            startElementX: left,
            startElementY: top,
            startOffsetX: dragStartEvent.x - left,
            startOffsetY: dragStartEvent.y - top
          };

          if (
            onDragStartRef.current?.({ event: dragStartEvent, ...startCoords! })
          ) {
            cleanup();
            return;
          }

          dragStartTriggered.current = true;
        }

        setMouseEvent(event);

        const data = dataRef.current;

        const targetElements = document.elementsFromPoint(event.x, event.y);

        const newTargets = new Set<Element>();

        for (const el of targetElements) {
          if (el.getAttribute("data-drop-target") === "false") {
            continue;
          }

          const handlers = dropHandlers.get(el);

          if (handlers) {
            newTargets.add(el);

            if (!dropTargets.has(el)) {
              handlers.onDragIn?.({ type, data, event });
            }
          }
        }

        for (const el of dropTargets) {
          const handlers = dropHandlers.get(el);

          if (!newTargets.has(el)) {
            handlers?.onDragOut?.({ type, data, event });
          }
        }

        dropTargets = newTargets;

        for (const el of newTargets) {
          const handlers = dropHandlers.get(el);

          handlers?.onDragMove?.({ type, data, event });
        }

        onDragMoveRef.current?.({
          event,
          dropTargets
        });
      };

      const mouseUpHandler = (event: MouseEvent) => {
        if (dragStartTriggered.current) {
          const data = dataRef.current;

          for (const el of dropTargets) {
            const handlers = dropHandlers.get(el);

            handlers?.onDrop?.({ type, data, event });
          }

          onDragEndRef.current?.({
            event,
            dropTargets,
            ...startCoords!
          });
        }

        cleanup();
      };

      const mouseDownHandler = (event: PointerEvent) => {
        const { target } = event;

        if ((target as Element).getAttribute("data-draggable") === "false") {
          return;
        }

        currentDragComponent = dragComponentRef.current;
        dragStartEventRef.current = event;

        document.addEventListener("pointermove", mouseMoveHandler);
        document.addEventListener("pointerup", mouseUpHandler);
      };

      element.addEventListener(
        "pointerdown",
        mouseDownHandler as EventListener
      );
      element.setAttribute("data-draggable", "true");

      return () => {
        element.removeEventListener(
          "pointerdown",
          mouseDownHandler as EventListener
        );
        element.removeAttribute("data-draggable");
      };
    }, [type]);

    const refToRef = useRef(null);

    const mergeRefs = useMergeRefs(refToRef, elementRef);

    return (reactElement: any) => {
      refToRef.current = reactElement.ref;

      return React.cloneElement(reactElement, { ref: mergeRefs });
    };
  }

  function makeHandler<T>(
    sourceTypes: DragSourceSymbol[],
    handlerRef: React.RefObject<DropHandler<T> | undefined>
  ) {
    if (!handlerRef.current) return;

    const result: DropHandler<T> = (props: DropHandlerProps<T>) => {
      if ((sourceTypes as Array<DragSourceSymbol>).includes(props.type)) {
        handlerRef.current?.(props);
      }
    };

    return result;
  }

  function useDropTarget<T extends DragSourceType<any>>({
    sourceTypes,
    data,
    onDragIn,
    onDragOut,
    onDragMove,
    onDrop
  }: DropTargetParams<T>) {
    const elementRef = useRef<Element | null>(null);

    const onDragInRef = useRef<DropHandler<T> | undefined>(onDragIn);
    const onDragOutRef = useRef<DropHandler<T> | undefined>(onDragOut);
    const onDragMoveRef = useRef<DropHandler<T> | undefined>(onDragMove);
    const onDropRef = useRef<DropHandler<T> | undefined>(onDrop);

    onDragInRef.current = onDragIn;
    onDragOutRef.current = onDragOut;
    onDragMoveRef.current = onDragMove;
    onDropRef.current = onDrop;

    useEffect(() => {
      const element = elementRef.current;

      if (!element) return;

      element.setAttribute("data-drop-target", "true");

      dropHandlers.set(element, {
        data,
        onDragIn: makeHandler(sourceTypes, onDragInRef),
        onDragOut: makeHandler(sourceTypes, onDragOutRef),
        onDragMove: makeHandler(sourceTypes, onDragMoveRef),
        onDrop: makeHandler(sourceTypes, onDropRef)
      });

      return () => {
        element.removeAttribute("data-drop-target");
        dropHandlers.delete(element);
      };
    }, [...sourceTypes]);

    const refToRef = useRef<any>(null);

    const mergeRefs = useMergeRefs(refToRef, elementRef);

    return (reactElement: any) => {
      refToRef.current = reactElement.ref;

      return React.cloneElement(reactElement, { ref: mergeRefs });
    };
  }

  function DragOverlay({
    style,
    className
  }: {
    style?: Record<string, any>;
    className?: string;
  }) {
    const observer = useObserver();

    return observer(() => {
      const mouseEvent = getMouseEvent();

      if (!mouseEvent) {
        return null;
      }

      return (
        <div className={className} style={style}>
          <div
            style={{
              position: "absolute",
              transform: `translateX(${mouseEvent.x}px) translateY(${mouseEvent.y}px)`
            }}
          >
            {currentDragComponent!({
              event: mouseEvent,
              dropTargets,
              ...startCoords!
            })}
          </div>
        </div>
      );
    });
  }

  return {
    getDropTargetData,
    useDragSource,
    useDropTarget,
    DragOverlay
  };
}
