export type DragSourceType<Data> = symbol & { __data: Data };

export type DragSourceDataType<SourceType> = SourceType extends DragSourceType<infer DataType>
  ? DataType
  : never;

export type DragSourceConfig<T extends DragSourceType<any>> = {
  type: T;
  data: DragSourceDataType<T>;
  onDragStart?: (params: {
    event: MouseEvent;
    startCoords: StartCoords;
  }) => boolean | undefined | void;
  onDragEnd?: (params: {
    event: MouseEvent;
    startCoords: StartCoords;
    dropTargets: Map<Element, DropTarget<any>>;
  }) => void;
  onDragMove?: (params: {
    event: MouseEvent;
    startCoords: StartCoords;
    dropTargets: Map<Element, DropTarget<any>>;
  }) => void;
  mouseConfig?: {
    mouseDown?: (element: HTMLElement, handler: (event: MouseEvent) => void) => () => void;
    mouseMove?: (document: Document, handler: (event: MouseEvent) => void) => () => void;
    mouseUp?: (document: Document, handler: (event: MouseEvent) => void) => () => void;
  };
};

export type DropHandlerProps<T> = T extends DragSourceType<infer Data>
  ? { sourceType: T; sourceData: Data; event: MouseEvent }
  : unknown;

export type DropHandler<T> = (props: DropHandlerProps<T>) => void;

export type DropTargetConfig<T> = {
  sourceTypes: Array<T>;
  data?: any;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};

type StartCoords = {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  offsetX: number;
  offsetY: number;
};

export const DROP_TARGET_ATTRIBUTE = "data-drop-target";

export const DRAGGABLE_ATTRIBUTE = "data-draggable";

export function dragSourceType<Data>(name: string): DragSourceType<Data> {
  return Symbol(name) as DragSourceType<Data>;
}

function defaultMouseDownHandler(element: HTMLElement, handler: (event: MouseEvent) => void) {
  element.addEventListener("pointerdown", handler);

  return () => {
    element.removeEventListener("pointerdown", handler);
  };
}

function defaultMouseMoveHandler(document: Document, handler: (event: MouseEvent) => void) {
  document.addEventListener("pointermove", handler);

  return () => {
    document.removeEventListener("pointermove", handler);
  };
}

function defaultMouseUpHandler(document: Document, handler: (event: MouseEvent) => void) {
  document.addEventListener("pointerup", handler);

  return () => {
    document.removeEventListener("pointerup", handler);
  };
}

const dropTargets = new WeakMap<Element, DropTarget<any>>();

export class DragSource<T extends DragSourceType<any>> {
  private dragElement: HTMLElement | null = null;

  private dragStartTriggered = false;

  private dragStartEvent: MouseEvent | null = null;

  private currentDropTargets = new Map<Element, DropTarget<any>>();

  private startCoords: StartCoords | null = null;

  private mouseEventsDestructor: (() => void) | null = null;

  constructor(public config: DragSourceConfig<T>) {}

  private mouseMoveHandler = (event: MouseEvent) => {
    const { onDragStart, onDragMove, data, type } = this.config!;

    if (!this.dragStartTriggered) {
      const dragStartEvent = this.dragStartEvent!;

      const { left, top } = this.dragElement!.getBoundingClientRect();

      this.startCoords = {
        x: dragStartEvent.x,
        y: dragStartEvent.y,
        elementX: left,
        elementY: top,
        offsetX: dragStartEvent.x - left,
        offsetY: dragStartEvent.y - top,
      };

      if (onDragStart?.({ event: dragStartEvent, startCoords: this.startCoords })) {
        this.cleanup();

        return;
      }

      this.dragStartTriggered = true;
    }

    const targetElementsList = document.elementsFromPoint(event.x, event.y);

    const targetElements = targetElementsList ? Array.from(targetElementsList) : [];

    const newTargets = new Map<Element, DropTarget<any>>();

    targetElements.forEach((element) => {
      const isDropTarget = element.getAttribute(DROP_TARGET_ATTRIBUTE);

      if (!isDropTarget || isDropTarget === "false") {
        return;
      }

      const dropTarget = dropTargets.get(element);

      if (dropTarget) {
        newTargets.set(element, dropTarget);

        if (!this.currentDropTargets.has(element)) {
          dropTarget.config.onDragIn?.({ sourceType: type, sourceData: data, event });
        }
      }
    });

    this.currentDropTargets.forEach((dropTarget, element) => {
      if (!newTargets.has(element)) {
        dropTarget.config.onDragOut?.({ sourceType: type, sourceData: data, event });
      }
    });

    this.currentDropTargets = newTargets;

    newTargets.forEach((dropTarget) => {
      dropTarget.config.onDragMove?.({ sourceType: type, sourceData: data, event });
    });

    onDragMove?.({
      event,
      startCoords: this.startCoords!,
      dropTargets: this.currentDropTargets,
    });
  };

  private mouseUpHandler = (event: MouseEvent) => {
    if (this.dragStartTriggered) {
      const { data, type, onDragEnd } = this.config!;

      this.currentDropTargets.forEach((dropTarget) => {
        dropTarget.config.onDrop?.({ sourceType: type, sourceData: data, event });
      });

      onDragEnd?.({
        event,
        dropTargets: this.currentDropTargets,
        startCoords: this.startCoords!,
      });
    }

    this.cleanup();
  };

  private mouseDownHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const dragElement = target.closest(`[${DRAGGABLE_ATTRIBUTE}]`);

    if (!dragElement) {
      return;
    }

    if (dragElement.getAttribute(DRAGGABLE_ATTRIBUTE) === "false") {
      return;
    }

    this.dragStartEvent = event;
    this.dragElement = dragElement as HTMLElement;

    const mouseMoveHandler = this.config.mouseConfig?.mouseMove ?? defaultMouseMoveHandler;
    const mouseUpHandler = this.config.mouseConfig?.mouseUp ?? defaultMouseUpHandler;

    const mouseMoveDestructor = mouseMoveHandler(document, this.mouseMoveHandler);
    const mouseUpDestructor = mouseUpHandler(document, this.mouseUpHandler);

    this.mouseEventsDestructor = () => {
      mouseMoveDestructor();
      mouseUpDestructor();
    };
  };

  private cleanup = () => {
    this.mouseEventsDestructor?.();

    this.startCoords = null;
    this.dragElement = null;
    this.dragStartEvent = null;
    this.dragStartTriggered = false;

    this.currentDropTargets.clear();
  };

  public setConfig = (config: DragSourceConfig<T>) => {
    this.config = config;
  };

  public listen = (element: HTMLElement): (() => void) => {
    const mouseDownHandler = this.config.mouseConfig?.mouseDown ?? defaultMouseDownHandler;

    const mouseDownDestructor = mouseDownHandler(element, this.mouseDownHandler);

    element.setAttribute(DRAGGABLE_ATTRIBUTE, "true");

    return () => {
      this.cleanup();

      mouseDownDestructor();

      element.removeAttribute(DRAGGABLE_ATTRIBUTE);
    };
  };
}

export class DropTarget<T> {
  constructor(public config: DropTargetConfig<T>) {}

  public setConfig = (config: DropTargetConfig<T>) => {
    this.config = config;
  };

  public listen = (element: HTMLElement) => {
    element.setAttribute(DROP_TARGET_ATTRIBUTE, "true");

    dropTargets.set(element, this);

    return () => {
      element.removeAttribute(DROP_TARGET_ATTRIBUTE);

      dropTargets.delete(element);
    };
  };

  get data() {
    return this.config.data;
  }
}

export function createDragSource<T extends DragSourceConfig<any>>(config: T) {
  return new DragSource(config);
}

export function createDropTarget<T extends DropTargetConfig<any>>(config: T) {
  return new DropTarget(config);
}
