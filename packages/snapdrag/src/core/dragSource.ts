import { DRAG_SOURCE_ATTRIBUTE, DROP_TARGET_ATTRIBUTE } from "./constants";
import { registeredDropTargets } from "./dropTarget";
import {
  Destructor,
  DragSourceConfig,
  DragSourceDataFactory,
  DragSourceDataType,
  DragSourceType,
  DragStarHandlerArgs,
  DropHandlerArgs,
  DropTargetsMap,
  IDragSource,
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

const disabledDropTargets = new Set<HTMLElement>();

const acceptedDropTargets = new Set<HTMLElement>();

export function dragSourceType<Data>(name: string): DragSourceType<Data> {
  return Symbol(name) as DragSourceType<Data>;
}

export class DragSource<T extends DragSourceType<any>> implements IDragSource<T> {
  private dragElement: HTMLElement | null = null;

  private dragStartTriggered = false;

  private dragStartEvent: MouseEvent | null = null;

  private newDropTargets: DropTargetsMap = new Map();

  private currentDropTargets: DropTargetsMap = new Map();

  private mouseEventsDestructor: Destructor | null = null;

  private pluginsSnapshot: PluginType[] = [];

  private currentData: DragSourceDataType<T> | null = null;

  constructor(public config: DragSourceConfig<T>) {}

  private getDropTargets(event: MouseEvent): DropTargetsMap {
    const targetElementsList = document.elementsFromPoint(event.x, event.y);

    const targetElements = (targetElementsList ?? []) as HTMLElement[];

    const dropTargets = new Map() as DropTargetsMap;

    targetElements.forEach((element) => {
      const dropTargetAttribute = element.getAttribute(DROP_TARGET_ATTRIBUTE);

      if (!dropTargetAttribute || dropTargetAttribute === "false") {
        return;
      }
      const dropTarget = registeredDropTargets.get(element);

      if (dropTarget) {
        dropTargets.set(element, dropTarget);
      }
    });

    return dropTargets;
  }

  private handleDragStart(event: MouseEvent) {
    const { shouldDrag, onDragStart } = this.config;

    const dragElement = this.dragElement!;
    const dragStartEvent = this.dragStartEvent!;

    const dragStartArgs: DragStarHandlerArgs<T> = {
      event,
      dragElement,
      dragStartEvent,
      data: this.currentData!,
    };

    if (shouldDrag && !shouldDrag(dragStartArgs)) {
      return false;
    }

    onDragStart?.(dragStartArgs);

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.onDragStart?.(dragStartArgs);
    });

    return true;
  }

  private handleDragMove(event: MouseEvent) {
    const { onDragMove } = this.config!;

    const dragMoveArgs = {
      event,
      dragElement: this.dragElement!,
      dragStartEvent: this.dragStartEvent!,
      dropTargets: this.currentDropTargets,
      data: this.currentData!,
    };

    onDragMove?.(dragMoveArgs);

    this.pluginsSnapshot.forEach((plugin) => {
      plugin.onDragMove?.(dragMoveArgs);
    });
  }

  private handleDragSourceEnd(event: MouseEvent) {
    const { type, onDragEnd } = this.config!;

    const dropTargets = this.currentDropTargets;
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
      if (disabledDropTargets.has(dropElement)) {
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

  private getEnabledDropTargets() {
    const enabledDropTargets = new Map() as DropTargetsMap;

    this.newDropTargets.forEach((dropTarget, dropElement) => {
      if (!disabledDropTargets.has(dropElement)) {
        enabledDropTargets.set(dropElement, dropTarget);
      }
    });

    return enabledDropTargets;
  }

  private getDropHandlerArgs(event: MouseEvent) {
    return {
      event,
      dragElement: this.dragElement!,
      dragStartEvent: this.dragStartEvent!,
      dropTargets: this.getEnabledDropTargets(),
      sourceType: this.config!.type,
      sourceData: this.currentData!,
    } as PartialDropArgs<T[]>;
  }

  private handleTargetDragInOrMove(dropHandlerArgs: PartialDropArgs<T[]>) {
    this.newDropTargets.forEach((dropTarget, dropElement) => {
      if (disabledDropTargets.has(dropElement)) {
        return;
      }

      const args = {
        ...dropHandlerArgs,
        dropTarget,
        dropElement,
      };

      if (this.currentDropTargets.has(dropElement)) {
        dropTarget.config.onDragMove?.(args);
      } else {
        dropTarget.config.onDragIn?.(args);
      }
    });
  }

  private handleTargetDragOut(dropHandlerArgs: PartialDropArgs<T[]>) {
    this.currentDropTargets.forEach((dropTarget, dropElement) => {
      if (this.newDropTargets.has(dropElement)) {
        return;
      }

      acceptedDropTargets.delete(dropElement);

      if (disabledDropTargets.delete(dropElement)) {
        return;
      }

      dropTarget.config.onDragOut?.({
        ...dropHandlerArgs,
        dropTarget,
        dropElement,
      });
    });
  }

  private mouseDownHandler(event: MouseEvent) {
    const { disabled, data, mouseConfig } = this.config;

    if (disabled) {
      return;
    }

    const target = event.target as HTMLElement;

    const dragElement = target.closest(`[${DRAG_SOURCE_ATTRIBUTE}]`) as HTMLElement;

    if (!dragElement || dragElement.getAttribute(DRAG_SOURCE_ATTRIBUTE) === "false") {
      return;
    }

    this.dragElement = dragElement;
    this.dragStartEvent = event;

    this.currentData =
      typeof data === "function"
        ? (data as DragSourceDataFactory<T>)({ dragElement, dragStartEvent: event })
        : data;

    const mouseMoveHandler = mouseConfig?.mouseMove ?? defaultMouseMoveHandler;
    const mouseUpHandler = mouseConfig?.mouseUp ?? defaultMouseUpHandler;

    const mouseMoveDestructor = mouseMoveHandler(this.safeMouseMoveHandler);
    const mouseUpDestructor = mouseUpHandler(this.safeMouseUpHandler);

    this.mouseEventsDestructor = () => {
      mouseMoveDestructor();
      mouseUpDestructor();
    };

    this.pluginsSnapshot = this.config.plugins?.slice() ?? [];
  }

  private populateDisableDropTargets(event: MouseEvent) {
    this.newDropTargets.forEach((dropTarget, element) => {
      const { accepts } = dropTarget.config;

      if (dropTarget.disabled) {
        disabledDropTargets.add(element);

        return;
      }

      let shouldAccept = true;

      if (Array.isArray(accepts)) {
        shouldAccept = accepts.includes(this.config.type);
      }

      if (
        typeof accepts === "function" &&
        !disabledDropTargets.has(element) &&
        !acceptedDropTargets.has(element)
      ) {
        shouldAccept = accepts({
          kind: this.config.type,
          data: this.currentData!,
          element: this.dragElement!,
          event,
        });
      }

      if (!shouldAccept) {
        disabledDropTargets.add(element);

        return;
      }

      acceptedDropTargets.add(element);
    });
  }

  private mouseMoveHandler(event: MouseEvent) {
    if (!this.dragStartTriggered) {
      if (!this.handleDragStart(event)) {
        return;
      }

      this.dragStartTriggered = true;
    }

    this.newDropTargets = this.getDropTargets(event);

    this.populateDisableDropTargets(event);

    const dropHandlerArgs = this.getDropHandlerArgs(event);

    this.handleTargetDragInOrMove(dropHandlerArgs);

    this.handleTargetDragOut(dropHandlerArgs);

    this.handleDragMove(event);

    this.currentDropTargets = this.newDropTargets;
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
    this.newDropTargets.clear();
    this.currentDropTargets.clear();
    this.currentData = null;

    disabledDropTargets.clear();
    acceptedDropTargets.clear();

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

    if (setAttribute && !element.hasAttribute(DRAG_SOURCE_ATTRIBUTE)) {
      element.setAttribute(DRAG_SOURCE_ATTRIBUTE, "true");
    }

    return () => {
      this.cleanup();

      mouseDownDestructor();

      if (setAttribute) {
        element.removeAttribute(DRAG_SOURCE_ATTRIBUTE);
      }
    };
  };
}

export function createDragSource<T extends DragSourceConfig<any>>(config: T) {
  return new DragSource(config);
}
