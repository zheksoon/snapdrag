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

type PartialDropArgs<T extends Array<DragSourceType<any>>> = Omit<
  DropHandlerArgs<T>,
  "dropTarget" | "dropElement"
>;

export const registeredDropTargets = new WeakMap<HTMLElement, IDropTarget<any>>();

const disabledDropTargets = new Set<IDropTarget<any>>();

export function dragSourceType<Data>(name: string): DragSourceType<Data> {
  return Symbol(name) as DragSourceType<Data>;
}

export class DragSource<T extends DragSourceType<any>> implements IDragSource<T> {
  private dragElement: HTMLElement | null = null;

  private dragStartTriggered = false;

  private dragStartEvent: MouseEvent | null = null;

  private currentDropTargets: DropTargetsMap | null = null;

  private mouseEventsDestructor: Destructor | null = null;

  private pluginsSnapshot: PluginType[] = [];

  private currentData: DragSourceDataType<T> | null = null;

  constructor(public config: DragSourceConfig<T>) {}

  private getDropTargetsMap(event: MouseEvent): DropTargetsMap {
    const targetElementsList = document.elementsFromPoint(event.x, event.y);

    const targetElements = targetElementsList ? Array.from(targetElementsList) : [];

    return targetElements.reduce((dropTargets, element) => {
      const dropTargetAtrribute = element.getAttribute(DROP_TARGET_ATTRIBUTE);

      if (dropTargetAtrribute && dropTargetAtrribute !== "false") {
        const dropTarget = registeredDropTargets.get(element as HTMLElement);

        if (dropTarget && !disabledDropTargets.has(dropTarget)) {
          dropTargets.set(element as HTMLElement, dropTarget);
        }
      }

      return dropTargets;
    }, new Map() as DropTargetsMap);
  }

  private handleDragSourceStart() {
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

  private handeDragSourceMove(event: MouseEvent) {
    const { onDragMove } = this.config!;

    const dragMoveArgs = {
      event,
      dragElement: this.dragElement!,
      dragStartEvent: this.dragStartEvent!,
      dropTargets: this.currentDropTargets!,
      data: this.currentData!,
    };

    onDragMove?.(dragMoveArgs);

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.onDragMove?.(dragMoveArgs);
    });
  }

  private handleDragSourceEnd(event: MouseEvent) {
    const { type, onDragEnd } = this.config!;

    const dropTargets = this.currentDropTargets!;
    const dragElement = this.dragElement!;
    const dragStartEvent = this.dragStartEvent!;

    const dropArgs = {
      event,
      dragElement,
      dragStartEvent,
      dropTargets,
      sourceType: type,
      sourceData: this.currentData!,
    };

    dropTargets.forEach((dropTarget, dropElement) => {
      if (dropTarget.disabled) {
        return;
      }

      dropTarget.config.onDrop?.({
        ...dropArgs,
        dropTarget,
        dropElement,
      });
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

  private getDropHanderArgs(event: MouseEvent, dropTargets: DropTargetsMap) {
    return {
      event,
      dragElement: this.dragElement!,
      dragStartEvent: this.dragStartEvent!,
      dropTargets,
      sourceType: this.config!.type,
      sourceData: this.currentData!,
    } as PartialDropArgs<T[]>;
  }

  private handleDragInOrMove(
    event: MouseEvent,
    currentDropTargets: DropTargetsMap,
    dropTargets: DropTargetsMap
  ) {
    const dropHandlerArgs = this.getDropHanderArgs(event, dropTargets);

    dropTargets.forEach((dropTarget, dropElement) => {
      if (dropTarget.disabled) {
        return;
      }

      const args = {
        ...dropHandlerArgs,
        dropTarget,
        dropElement,
      };

      if (!currentDropTargets.has(dropElement)) {
        const shouldAccept = dropTarget.config.shouldAccept?.(args) ?? true;

        if (!shouldAccept) {
          disabledDropTargets.add(dropTarget);

          return;
        }

        dropTarget.config.onDragIn?.(args);
      } else {
        dropTarget.config.onDragMove?.(args);
      }
    });
  }

  private handleDragOut(
    event: MouseEvent,
    currentDropTargets: DropTargetsMap,
    dropTargets: DropTargetsMap
  ) {
    const dropHandlerArgs = this.getDropHanderArgs(event, dropTargets);

    currentDropTargets.forEach((dropTarget, dropElement) => {
      if (dropTarget.disabled) {
        return;
      }

      if (!dropTargets.has(dropElement)) {
        dropTarget.config.onDragOut?.({
          ...dropHandlerArgs,
          dropTarget,
          dropElement,
        });
      }
    });
  }

  private mouseDownHandler(event: MouseEvent) {
    if (this.config.disabled) {
      return;
    }

    const target = event.target as HTMLElement;

    const dragElement = target.closest(`[${DRAGGABLE_ATTRIBUTE}]`);

    if (!dragElement || dragElement.getAttribute(DRAGGABLE_ATTRIBUTE) === "false") {
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

  private mouseMoveHandler(event: MouseEvent) {
    if (!this.dragStartTriggered) {
      this.dragStartTriggered = true;

      if (!this.handleDragSourceStart()) {
        return;
      }
    }

    const dropTargets = this.getDropTargetsMap(event);

    const currentDropTargets: DropTargetsMap = this.currentDropTargets ?? new Map();

    this.handleDragInOrMove(event, currentDropTargets, dropTargets);

    this.handleDragOut(event, currentDropTargets, dropTargets);

    this.handeDragSourceMove(event);

    this.currentDropTargets = dropTargets;
  }

  private mouseUpHandler(event: MouseEvent) {
    if (this.dragStartTriggered) {
      this.handleDragSourceEnd(event);
    }

    this.cleanup();
  }

  private cleanup() {
    this.mouseEventsDestructor?.();
    this.mouseEventsDestructor = null;

    this.dragElement = null;
    this.dragStartTriggered = false;
    this.currentDropTargets = null;
    this.currentData = null;

    disabledDropTargets.clear();

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.cleanup?.();
    });

    this.pluginsSnapshot = [];
  }

  private safeMouseMoveHandler = (event: MouseEvent) => {
    try {
      this.mouseMoveHandler(event);
    } catch (err) {
      this.cleanup();

      throw err;
    }
  };

  private safeMouseUpHandler = (event: MouseEvent) => {
    try {
      this.mouseUpHandler(event);
    } catch (err) {
      this.cleanup();

      throw err;
    }
  };

  private safeMouseDownHandler = (event: MouseEvent) => {
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
