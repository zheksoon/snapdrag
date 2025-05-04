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
  private _dragElement: HTMLElement | null = null;

  private _dragStartTriggered = false;

  private _dragStartEvent: MouseEvent | null = null;

  private _newDropTargets: DropTargetsMap = new Map();

  private _currentDropTargets: DropTargetsMap = new Map();

  private _mouseEventsDestructor: Destructor | null = null;

  private _pluginsSnapshot: PluginType[] = [];

  private _currentData: DragSourceDataType<T> | null = null;

  constructor(public config: DragSourceConfig<T>) {}

  private _getDropTargets(event: MouseEvent): DropTargetsMap {
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

  private _handleDragStart(event: MouseEvent) {
    const { shouldDrag, onDragStart } = this.config;

    const dragElement = this._dragElement!;
    const dragStartEvent = this._dragStartEvent!;

    const dragStartArgs: DragStarHandlerArgs<T> = {
      event,
      dragElement,
      dragStartEvent,
      data: this._currentData!,
    };

    if (shouldDrag && !shouldDrag(dragStartArgs)) {
      return false;
    }

    onDragStart?.(dragStartArgs);

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.onDragStart?.(dragStartArgs);
    });

    return true;
  }

  private _handleDragMove(event: MouseEvent) {
    const { onDragMove } = this.config!;

    const dragMoveArgs = {
      event,
      dragElement: this._dragElement!,
      dragStartEvent: this._dragStartEvent!,
      dropTargets: this._currentDropTargets,
      data: this._currentData!,
    };

    onDragMove?.(dragMoveArgs);

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.onDragMove?.(dragMoveArgs);
    });
  }

  private _handleDragSourceEnd(event: MouseEvent) {
    const { type, onDragEnd } = this.config!;

    const dropTargets = this._currentDropTargets;
    const dragElement = this._dragElement!;
    const dragStartEvent = this._dragStartEvent!;

    const dropArgs = {
      event,
      dragElement,
      dragStartEvent,
      dropTargets,
      sourceType: type,
      sourceData: this._currentData!,
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
      data: this._currentData!,
    };

    onDragEnd?.(dragEndArgs);

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.onDragEnd?.(dragEndArgs);
    });
  }

  private _getEnabledDropTargets() {
    const enabledDropTargets = new Map() as DropTargetsMap;

    this._newDropTargets.forEach((dropTarget, dropElement) => {
      if (!disabledDropTargets.has(dropElement)) {
        enabledDropTargets.set(dropElement, dropTarget);
      }
    });

    return enabledDropTargets;
  }

  private _getDropHandlerArgs(event: MouseEvent) {
    return {
      event,
      dragElement: this._dragElement!,
      dragStartEvent: this._dragStartEvent!,
      dropTargets: this._getEnabledDropTargets(),
      sourceType: this.config!.type,
      sourceData: this._currentData!,
    } as PartialDropArgs<T[]>;
  }

  private _handleTargetDragInOrMove(dropHandlerArgs: PartialDropArgs<T[]>) {
    this._newDropTargets.forEach((dropTarget, dropElement) => {
      if (disabledDropTargets.has(dropElement)) {
        return;
      }

      const args = {
        ...dropHandlerArgs,
        dropTarget,
        dropElement,
      };

      if (this._currentDropTargets.has(dropElement)) {
        dropTarget.config.onDragMove?.(args);
      } else {
        dropTarget.config.onDragIn?.(args);
      }
    });
  }

  private _handleTargetDragOut(dropHandlerArgs: PartialDropArgs<T[]>) {
    this._currentDropTargets.forEach((dropTarget, dropElement) => {
      if (this._newDropTargets.has(dropElement)) {
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

  private _mouseDownHandler(event: MouseEvent) {
    const { disabled, data, mouseConfig } = this.config;

    if (disabled) {
      return;
    }

    const target = event.target as HTMLElement;

    const dragElement = target.closest(`[${DRAG_SOURCE_ATTRIBUTE}]`) as HTMLElement;

    if (!dragElement || dragElement.getAttribute(DRAG_SOURCE_ATTRIBUTE) === "false") {
      return;
    }

    this._dragElement = dragElement;
    this._dragStartEvent = event;

    this._currentData =
      typeof data === "function"
        ? (data as DragSourceDataFactory<T>)({ dragElement, dragStartEvent: event })
        : data;

    const mouseMoveHandler = mouseConfig?.mouseMove ?? defaultMouseMoveHandler;
    const mouseUpHandler = mouseConfig?.mouseUp ?? defaultMouseUpHandler;

    const mouseMoveDestructor = mouseMoveHandler(this._safeMouseMoveHandler);
    const mouseUpDestructor = mouseUpHandler(this._safeMouseUpHandler);

    this._mouseEventsDestructor = () => {
      mouseMoveDestructor();
      mouseUpDestructor();
    };

    this._pluginsSnapshot = this.config.plugins?.slice() ?? [];
  }

  private _populateDisableDropTargets(event: MouseEvent) {
    this._newDropTargets.forEach((dropTarget, element) => {
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
          data: this._currentData!,
          element: this._dragElement!,
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

  private _mouseMoveHandler(event: MouseEvent) {
    if (!this._dragStartTriggered) {
      if (!this._handleDragStart(event)) {
        return;
      }

      this._dragStartTriggered = true;
    }

    this._newDropTargets = this._getDropTargets(event);

    this._populateDisableDropTargets(event);

    const dropHandlerArgs = this._getDropHandlerArgs(event);

    this._handleTargetDragInOrMove(dropHandlerArgs);

    this._handleTargetDragOut(dropHandlerArgs);

    this._handleDragMove(event);

    this._currentDropTargets = this._newDropTargets;
  }

  private _mouseUpHandler(event: MouseEvent) {
    if (this._dragStartTriggered) {
      this._handleDragSourceEnd(event);
    }

    this._cleanup();
  }

  private _cleanup() {
    this._mouseEventsDestructor?.();
    this._mouseEventsDestructor = null;

    this._dragElement = null;
    this._dragStartTriggered = false;
    this._newDropTargets.clear();
    this._currentDropTargets.clear();
    this._currentData = null;

    disabledDropTargets.clear();
    acceptedDropTargets.clear();

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.cleanup?.();
    });

    this._pluginsSnapshot = [];
  }

  private _safeMouseMoveHandler = (event: MouseEvent) => {
    try {
      this._mouseMoveHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  private _safeMouseUpHandler = (event: MouseEvent) => {
    try {
      this._mouseUpHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  private _safeMouseDownHandler = (event: MouseEvent) => {
    try {
      this._mouseDownHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  public setConfig = (config: DragSourceConfig<T>) => {
    this.config = config;
  };

  public listen = (element: HTMLElement, setAttribute = true): Destructor => {
    const mouseDownHandler = this.config.mouseConfig?.mouseDown ?? defaultMouseDownHandler;

    const mouseDownDestructor = mouseDownHandler(element, this._safeMouseDownHandler);

    if (setAttribute && !element.hasAttribute(DRAG_SOURCE_ATTRIBUTE)) {
      element.setAttribute(DRAG_SOURCE_ATTRIBUTE, "true");
    }

    return () => {
      this._cleanup();

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
