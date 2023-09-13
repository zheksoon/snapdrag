import React, { PropsWithChildren, useMemo, useRef } from "react";

type StartCoords = {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  offsetX: number;
  offsetY: number;
};

type DragSourceSymbol = string | symbol;

export type DragSourceType<Data> = DragSourceSymbol & { __data: Data };

export type DropHandlerProps<T> = T extends DragSourceType<infer Data>
  ? { type: DragSourceSymbol; data: Data; event: MouseEvent }
  : never;

export type DropHandler<T> = (props: DropHandlerProps<T>) => void;

export type DragSourceConfig<T> = {
  type: DragSourceType<T>;
  data: T;
  onDragStart: (
    params: { event: MouseEvent, startCoords: StartCoords }
  ) => boolean | undefined | void;
  onDragEnd: (
    params: {
      event: MouseEvent;
      startCoords: StartCoords,
      dropTargets: Set<Element>;
    }
  ) => void;
  onDragMove: (params: {
    event: MouseEvent;
    startCoords: StartCoords,
    dropTargets: Set<Element>;
  }) => void;
};

export type DropTargetConfig<T> = {
  sourceTypes: Array<T>;
  data?: any;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};

export interface IDragSourceHandler<T> {
  startListening: (element: HTMLElement) => (() => void);
}

export interface IDropTargetHandler<T> {
  startListening: (element: HTMLElement) => (() => void);
}

export interface DragContextT {
  createDragSource: <T>(config: DragSourceConfig<T>) => IDragSourceHandler<T>,
  createDropTarget: <T>(config: DropTargetConfig<T>) => IDropTargetHandler<T>;
}

const DROP_TARGET_ATTRIBUTE = "data-drop-target";
const DRAGGABLE_ATTRIBUTE = "data-draggable";

export function dragSourceType<Data>(
  type: DragSourceSymbol
): DragSourceType<Data> {
  return type as DragSourceType<Data>;
}

export function createDragContext() {
  const dropTargetComponents = new WeakMap<
    Element,
    DropTargetHandler<any>
  >();

  let startCoords: StartCoords | null = null;

  function getDropTargetHandlers(target: Element) {
    return dropTargetComponents.get(target)?.config;
  }

  function getDropTargetData(target: Element): any[] {
    return getDropTargetHandlers(target)?.data;
  }

  class DragSourceHandler<T> implements IDragSourceHandler<T> {
    public dragSourceElement: HTMLElement | null = null;

    private dragStartTriggered = false;

    private dragStartEvent: PointerEvent | null = null;

    private dropTargets = new Set<Element>();

    constructor(private config: DragSourceConfig<T>) {}

    private mouseMoveHandler = (event: MouseEvent) => {
      const { onDragStart, onDragMove, data, type } = this.config!;

      if (!this.dragStartTriggered) {
        const dragStartEvent = this.dragStartEvent!;

        const { left, top } = this.dragSourceElement!.getBoundingClientRect();

        startCoords = {
          x: dragStartEvent.x,
          y: dragStartEvent.y,
          elementX: left,
          elementY: top,
          offsetX: dragStartEvent.x - left,
          offsetY: dragStartEvent.y - top,
        };

        if (onDragStart?.({ event: dragStartEvent, startCoords })) {
          this.cleanup();

          return;
        }

        this.dragStartTriggered = true;
      }

      const targetElementsList = document.elementsFromPoint(event.x, event.y);

      const targetElements = targetElementsList
        ? Array.from(targetElementsList)
        : [];

      const newTargets = new Set<Element>();

      for (const el of targetElements) {
        const isDropTarget = el.getAttribute(DROP_TARGET_ATTRIBUTE);

        if (!isDropTarget || isDropTarget === "false") {
          continue;
        }

        const targetHandlers = getDropTargetHandlers(el);

        if (targetHandlers) {
          newTargets.add(el);

          if (!this.dropTargets.has(el)) {
            targetHandlers.onDragIn?.({ type, data, event });
          }
        }
      }

      for (const el of this.dropTargets) {
        if (!newTargets.has(el)) {
          const targetHandlers = getDropTargetHandlers(el);

          targetHandlers?.onDragOut?.({ type, data, event });
        }
      }

      this.dropTargets = newTargets;

      for (const el of newTargets) {
        const targetHandlers = getDropTargetHandlers(el);

        targetHandlers?.onDragMove?.({ type, data, event });
      }

      onDragMove?.({
        event,
        startCoords: startCoords!,
        dropTargets: this.dropTargets,
      });
    };

    private mouseUpHandler = (event: MouseEvent) => {
      if (this.dragStartTriggered) {
        const { data, type, onDragEnd } = this.config!;

        for (const el of this.dropTargets) {
          const targetHandlers = getDropTargetHandlers(el);

          targetHandlers?.onDrop?.({ type, data, event });
        }

        onDragEnd?.({
          event,
          dropTargets: this.dropTargets,
          startCoords: startCoords!,
        });
      }

      this.cleanup();
    };

    private mouseDownHandler = (event: PointerEvent) => {
      const { target } = event;

      if ((target as Element)?.getAttribute(DRAGGABLE_ATTRIBUTE) === "false") {
        return;
      }

      this.dragStartEvent = event;

      document.addEventListener("pointermove", this.mouseMoveHandler);
      document.addEventListener("pointerup", this.mouseUpHandler);
    };

    private cleanup = () => {
      document.removeEventListener("pointermove", this.mouseMoveHandler);
      document.removeEventListener("pointerup", this.mouseUpHandler);

      startCoords = null;

      this.dragStartEvent = null;
      this.dragStartTriggered = false;

      this.dropTargets.clear();
    };
    
    public startListening = (element: HTMLElement): (() => void) => {
      this.dragSourceElement = element;

      element.addEventListener("pointerdown", this.mouseDownHandler);
      element.setAttribute(DRAGGABLE_ATTRIBUTE, "true");

      return () => {
        this.cleanup();

        element.removeEventListener("pointerdown", this.mouseDownHandler);
        element.removeAttribute(DRAGGABLE_ATTRIBUTE);
      };
    };
  }

  class DropTargetHandler<T> implements IDropTargetHandler<T> {
    constructor(public config: DropTargetConfig<T>) {}
    
    public startListening = (element: HTMLElement) => {
      element.setAttribute(DROP_TARGET_ATTRIBUTE, "true");

      dropTargetComponents.set(element, this);

      return () => {
        element.removeAttribute(DROP_TARGET_ATTRIBUTE);

        dropTargetComponents.delete(element);
      }
    }
  }

  function createDragSource<T>(config: DragSourceConfig<T>) {
    return new DragSourceHandler(config);
  }

  function createDropTarget<T>(config: DropTargetConfig<T>) {
    return new DropTargetHandler(config);
  }

  return {
    createDragSource,
    createDropTarget,
    getDropTargetData,
    context: {
      createDragSource,
      createDropTarget,
      getDropTargetData,
    }
  }
}
