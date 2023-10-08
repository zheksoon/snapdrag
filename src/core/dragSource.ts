import { DRAGGABLE_ATTRIBUTE, DROP_TARGET_ATTRIBUTE } from "./constants";
import {
  Destructor,
  DragSourceConfig,
  DragSourceDataFactory,
  DragSourceDataType,
  DragSourceType,
  DragStarHandlertArgs,
  DropHandlerArgs,
  DropTargetsMap,
  IDragSource,
  IDropTarget,
  PluginType,
} from "./types";
import {
  defaultMouseDownHandler,
  defaultMouseMoveHandler,
  defaultMouseUpHandler,
} from "./utils/defaultMouseHandlers";

type PartialDropArgs<T> = Omit<DropHandlerArgs<T>, "dropTarget" | "dropElement">;

export const dropTargets = new WeakMap<Element, IDropTarget<any>>();

export function dragSourceType<Data>(name: string): DragSourceType<Data> {
  return Symbol(name) as DragSourceType<Data>;
}

export class DragSource<T extends DragSourceType<any>> implements IDragSource<T> {
  private dragElement: HTMLElement | null = null;

  private dragStartTriggered = false;

  private dragStartEvent: UIEvent | null = null;

  private currentDropTargets: DropTargetsMap | null = null;

  private mouseEventsDestructor: Destructor | null = null;

  private pluginsSnapshot: PluginType[] = [];

  private currentData: DragSourceDataType<T> | null = null;

  constructor(public config: DragSourceConfig<T>) {}

  private getDropTargetsMap(event: UIEvent) {
    const { x, y } = event as MouseEvent;

    const targetElementsList = document.elementsFromPoint(x, y);

    const targetElements = targetElementsList ? Array.from(targetElementsList) : [];

    const newDropTargets: DropTargetsMap = new Map();

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

    return newDropTargets;
  }

  private handleDragStart() {
    const { shouldDrag, onDragStart, data } = this.config!;

    const dragElement = this.dragElement!;
    const dragStartEvent = this.dragStartEvent!;

    this.currentData =
      typeof data === "function"
        ? (data as DragSourceDataFactory<T>)({ dragElement, dragStartEvent })
        : data;

    const dragStartArgs: DragStarHandlertArgs<T> = {
      dragElement,
      dragStartEvent,
      data: this.currentData!,
    };

    const shouldProceed = shouldDrag?.(dragStartArgs) ?? true;

    if (!shouldProceed) {
      this.cleanup();

      return false;
    }

    onDragStart?.(dragStartArgs);

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.onDragStart?.(dragStartArgs);
    });

    return true;
  }

  private handleDragInOrMove(
    currentDropTargets: DropTargetsMap,
    newDropTargets: DropTargetsMap,
    dropHandlerArgs: PartialDropArgs<T>
  ) {
    newDropTargets.forEach((dropTarget, dropElement) => {
      if (dropTarget.disabled) {
        return;
      }

      const args = { ...dropHandlerArgs, dropTarget, dropElement };

      if (!currentDropTargets.has(dropElement)) {
        dropTarget.config.onDragIn?.(args);
      } else {
        dropTarget.config.onDragMove?.(args);
      }
    });
  }

  handleDragOut(
    currentDropTargets: DropTargetsMap,
    newDropTargets: DropTargetsMap,
    dropHandlerArgs: PartialDropArgs<T>
  ) {
    currentDropTargets.forEach((dropTarget, dropElement) => {
      if (dropTarget.disabled) {
        return;
      }

      if (!newDropTargets.has(dropElement)) {
        dropTarget.config.onDragOut?.({ ...dropHandlerArgs, dropTarget, dropElement });
      }
    });
  }

  private mouseMoveHandler(event: UIEvent) {
    const { onDragMove, data, type } = this.config!;

    const dragElement = this.dragElement!;
    const dragStartEvent = this.dragStartEvent!;

    if (!this.dragStartTriggered) {
      this.dragStartTriggered = true;

      if (!this.handleDragStart()) {
        return;
      }
    }

    const dropTargets = this.getDropTargetsMap(event);

    const currentDropTargets = this.currentDropTargets ?? new Map<Element, IDropTarget<any>>();

    const dropHandlerArgs: PartialDropArgs<T> = {
      sourceType: type,
      sourceData: data as DragSourceDataType<T>,
      dropTargets,
      event,
      dragElement,
      dragStartEvent,
    };

    this.handleDragInOrMove(currentDropTargets, dropTargets, dropHandlerArgs);

    this.handleDragOut(currentDropTargets, dropTargets, dropHandlerArgs);

    this.currentDropTargets = dropTargets;

    const dragMoveHandlerArgs = {
      dragElement,
      event,
      dragStartEvent,
      dropTargets,
      data: this.currentData!,
    };

    onDragMove?.(dragMoveHandlerArgs);

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.onDragMove?.(dragMoveHandlerArgs);
    });
  }

  private mouseUpHandler(event: UIEvent) {
    if (this.dragStartTriggered) {
      const { type, onDragEnd } = this.config!;

      const dropTargets = this.currentDropTargets!;
      const dragElement = this.dragElement!;
      const dragStartEvent = this.dragStartEvent!;

      const dropArgs = {
        sourceType: type,
        sourceData: this.currentData!,
        dropTargets,
        event,
        dragElement,
        dragStartEvent,
      };

      dropTargets.forEach((dropTarget, dropElement) => {
        if (!dropTarget.disabled) {
          dropTarget.config.onDrop?.({
            ...dropArgs,
            dropTarget,
            dropElement,
          });
        }
      });

      const dragEndArgs = {
        event,
        dragElement,
        dragStartEvent,
        dropTargets,
        data: this.currentData!,
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
    this.currentData = null;

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.cleanup?.();
    });

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

export function createDragSource<T extends DragSourceConfig<any>>(config: T) {
  return new DragSource(config);
}
