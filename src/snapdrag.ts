export type DragSourceType<Data> = symbol & { __data: Data };

type DragSourceDataType<SourceType> = SourceType extends DragSourceType<infer DataType>
  ? DataType
  : never;

type UIEventHandler = (event: UIEvent) => void;
type Destructor = () => void;

type DragStarHandlertArgs = { element: HTMLElement; dragStartEvent: UIEvent };
type DragHandlerArgs = {
  element: HTMLElement;
  event: UIEvent;
  dragStartEvent: UIEvent;
  dropTargets: Map<Element, DropTarget<any>>;
};

export type PluginType = {
  onDragStart?: (args: DragStarHandlertArgs) => boolean | undefined | void;
  onDragMove?: (args: DragHandlerArgs) => void;
  onDragEnd?: (args: DragHandlerArgs) => void;
};

export type MouseConfig = {
  mouseDown?: (element: HTMLElement, handler: UIEventHandler) => Destructor;
  mouseMove?: (handler: UIEventHandler) => Destructor;
  mouseUp?: (handler: UIEventHandler) => Destructor;
};

export type DragSourceConfig<T extends DragSourceType<any>> = {
  disabled?: boolean;
  type: T;
  data: DragSourceDataType<T>;
  shouldDrag?: (args: DragStarHandlertArgs) => boolean;
  onDragStart?: (args: DragStarHandlertArgs) => void;
  onDragEnd?: (args: DragHandlerArgs) => void;
  onDragMove?: (args: DragHandlerArgs) => void;
  mouseConfig?: MouseConfig;
  plugins?: Array<PluginType>;
};

export type DropHandler<T> = (props: {
  dropTarget: DropTarget<T>;
  dropElement: Element;
  sourceType: T;
  sourceData: DragSourceDataType<T>;
  dropTargets: Map<Element, DropTarget<any>>;
  event: UIEvent;
  dragStartEvent: UIEvent;
  dragElement: Element;
}) => void;

export type DropTargetConfig<T> = {
  disabled?: boolean;
  sourceTypes: Array<T>;
  data?: any;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};

export const DROP_TARGET_ATTRIBUTE = "data-drop-target";

export const DRAGGABLE_ATTRIBUTE = "data-draggable";

export function dragSourceType<Data>(name: string): DragSourceType<Data> {
  return Symbol(name) as DragSourceType<Data>;
}

function defaultMouseDownHandler(element: HTMLElement, handler: UIEventHandler) {
  element.addEventListener("pointerdown", handler);

  return () => {
    element.removeEventListener("pointerdown", handler);
  };
}

function defaultMouseMoveHandler(handler: UIEventHandler) {
  document.addEventListener("pointermove", handler);

  return () => {
    document.removeEventListener("pointermove", handler);
  };
}

function defaultMouseUpHandler(handler: UIEventHandler) {
  document.addEventListener("pointerup", handler);

  return () => {
    document.removeEventListener("pointerup", handler);
  };
}

const dropTargets = new WeakMap<Element, DropTarget<any>>();

export class DragSource<T extends DragSourceType<any>> {
  private dragElement: HTMLElement | null = null;

  private dragStartTriggered = false;

  private dragStartEvent: UIEvent | null = null;

  private currentDropTargets: Map<Element, DropTarget<any>> | null = null;

  private mouseEventsDestructor: Destructor | null = null;

  private pluginsSnapshot: PluginType[] = [];

  constructor(public config: DragSourceConfig<T>) {}

  private mouseMoveHandler(event: UIEvent) {
    const { shouldDrag, onDragStart, onDragMove, data, type, plugins } = this.config!;

    const dragElement = this.dragElement!;
    const dragStartEvent = this.dragStartEvent!;

    if (!this.dragStartTriggered) {
      this.dragStartTriggered = true;

      const dragStartArgs = { element: dragElement, dragStartEvent };

      const _shouldDrag = shouldDrag?.(dragStartArgs) ?? true;

      if (!_shouldDrag) {
        this.cleanup();

        return;
      }

      onDragStart?.(dragStartArgs);

      this.pluginsSnapshot.forEach((plugin) => {
        plugin.onDragStart?.(dragStartArgs);
      });
    }

    const { x, y } = event as MouseEvent;

    const targetElementsList = document.elementsFromPoint(x, y);

    const targetElements = targetElementsList ? Array.from(targetElementsList) : [];

    const newDropTargets = new Map<Element, DropTarget<any>>();

    const currentDropTargets = this.currentDropTargets ?? new Map<Element, DropTarget<any>>();

    targetElements.forEach((element) => {
      const isDropTarget = element.getAttribute(DROP_TARGET_ATTRIBUTE);

      if (!isDropTarget || isDropTarget === "false") {
        return;
      }

      const dropTarget = dropTargets.get(element);

      if (dropTarget) {
        newDropTargets.set(element, dropTarget);
      }
    });

    const dropHandlerArgs = {
      sourceType: type,
      sourceData: data,
      dropTargets: newDropTargets,
      event,
      dragElement,
      dragStartEvent,
    };

    newDropTargets.forEach((dropTarget, dropElement) => {
      if (!dropTarget.disabled) {
        if (!currentDropTargets.has(dropElement)) {
          dropTarget.config.onDragIn?.({
            dropTarget,
            dropElement,
            ...dropHandlerArgs,
          });
        }

        dropTarget.config.onDragMove?.({
          dropTarget,
          dropElement,
          ...dropHandlerArgs,
        });
      }
    });

    currentDropTargets.forEach((dropTarget, dropElement) => {
      if (!dropTarget.disabled && !newDropTargets.has(dropElement)) {
        dropTarget.config.onDragOut?.({
          dropTarget,
          dropElement,
          ...dropHandlerArgs,
        });
      }
    });

    this.currentDropTargets = newDropTargets;

    const dragMoveHandlerArgs = {
      element: dragElement,
      event,
      dragStartEvent,
      dropTargets: newDropTargets,
    };

    onDragMove?.(dragMoveHandlerArgs);

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.onDragEnd?.(dragMoveHandlerArgs);
    });
  }

  private mouseUpHandler(event: UIEvent) {
    if (this.dragStartTriggered) {
      const { data, type, onDragEnd, plugins } = this.config!;

      const dropTargets = this.currentDropTargets!;
      const dragElement = this.dragElement!;
      const dragStartEvent = this.dragStartEvent!;

      dropTargets.forEach((dropTarget, dropElement) => {
        if (!dropTarget.disabled) {
          dropTarget.config.onDrop?.({
            dropTarget,
            dropElement,
            sourceType: type,
            sourceData: data,
            dropTargets,
            event,
            dragElement,
            dragStartEvent,
          });
        }
      });

      const dragEndArgs = {
        element: dragElement,
        event,
        dragStartEvent,
        dropTargets,
      };

      onDragEnd?.(dragEndArgs);

      this.pluginsSnapshot.forEach((plugin) => {
        plugin.onDragEnd?.(dragEndArgs);
      });
    }

    this.cleanup();
  }

  private mouseDownHandler(event: UIEvent) {
    if (this.config.disabled) {
      return;
    }

    const target = event.target as HTMLElement;

    const dragElement = target.closest(`[${DRAGGABLE_ATTRIBUTE}]`);

    if (!dragElement) {
      return;
    }

    if (dragElement.getAttribute(DRAGGABLE_ATTRIBUTE) === "false") {
      return;
    }

    this.dragElement = dragElement as HTMLElement;
    this.dragStartEvent = event;

    const mouseMoveHandler = this.config.mouseConfig?.mouseMove ?? defaultMouseMoveHandler;
    const mouseUpHandler = this.config.mouseConfig?.mouseUp ?? defaultMouseUpHandler;

    const mouseMoveDestructor = mouseMoveHandler(this.safeMouseMoveHandler);
    const mouseUpDestructor = mouseUpHandler(this.safeMouseUpHandler);

    this.mouseEventsDestructor = () => {
      mouseMoveDestructor();
      mouseUpDestructor();
    };

    this.pluginsSnapshot = this.config.plugins?.slice() ?? [];
  }

  private cleanup() {
    this.mouseEventsDestructor?.();
    this.mouseEventsDestructor = null;

    this.dragElement = null;
    this.dragStartTriggered = false;
    this.currentDropTargets = null;
    this.pluginsSnapshot = [];
  }

  private safeMouseMoveHandler = (event: UIEvent) => {
    try {
      this.mouseMoveHandler(event);
    } catch (err) {
      this.cleanup();

      throw err;
    }
  };

  private safeMouseUpHandler = (event: UIEvent) => {
    try {
      this.mouseUpHandler(event);
    } catch (err) {
      this.cleanup();

      throw err;
    }
  };

  private safeMouseDownHandler = (event: UIEvent) => {
    try {
      this.mouseDownHandler(event);
    } catch (err) {
      this.cleanup();

      throw err;
    }
  };

  public setConfig = (config: DragSourceConfig<T>) => {
    this.config = config;
  };

  public listen = (element: HTMLElement, setAttribute = true): Destructor => {
    const mouseDownHandler = this.config.mouseConfig?.mouseDown ?? defaultMouseDownHandler;

    const mouseDownDestructor = mouseDownHandler(element, this.safeMouseDownHandler);

    if (setAttribute) {
      element.setAttribute(DRAGGABLE_ATTRIBUTE, "true");
    }

    return () => {
      this.cleanup();

      mouseDownDestructor();

      if (setAttribute) {
        element.removeAttribute(DRAGGABLE_ATTRIBUTE);
      }
    };
  };
}

export class DropTarget<T> {
  constructor(public config: DropTargetConfig<T>) {}

  public setConfig = (config: DropTargetConfig<T>) => {
    this.config = config;
  };

  public listen = (element: HTMLElement): Destructor => {
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

  get disabled() {
    return this.config.disabled ?? false;
  }
}

export function createDragSource<T extends DragSourceConfig<any>>(config: T) {
  return new DragSource(config);
}

export function createDropTarget<T extends DropTargetConfig<any>>(config: T) {
  return new DropTarget(config);
}
