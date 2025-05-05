import { DRAGGABLE_ATTRIBUTE, DROPPABLE_ATTRIBUTE } from "./constants";
import { registeredDropTargets } from "./droppable";
import {
  Destructor,
  DraggableConfig,
  DraggableDataFactory,
  DragStarHandlerArgs,
  DropHandlerArgs,
  DropTargetsMap,
  IDraggable,
  PluginType,
} from "./types";
import {
  defaultPointerDownHandler,
  defaultPointerMoveHandler,
  defaultPointerUpHandler,
  defaultPointerCancelHandler,
} from "./utils/defaultPointerHandlers";

type PartialDropArgs = Omit<DropHandlerArgs, "dropTarget" | "dropElement">;

const disabledDropTargets = new Set<HTMLElement>();

const acceptedDropTargets = new Set<HTMLElement>();

export class Draggable implements IDraggable {
  private _dragElement: HTMLElement | null = null;

  private _dragStartTriggered = false;

  private _dragStartEvent: PointerEvent | null = null;

  private _newDropTargets: DropTargetsMap = new Map();

  private _currentDropTargets: DropTargetsMap = new Map();

  private _pointerEventsDestructor: Destructor | null = null;

  private _pluginsSnapshot: PluginType[] = [];

  private _currentData: any | null = null;

  constructor(public config: DraggableConfig) {}

  private _getDropTargets(event: PointerEvent): DropTargetsMap {
    const targetElementsList = document.elementsFromPoint(event.x, event.y);

    const targetElements = (targetElementsList ?? []) as HTMLElement[];

    const dropTargets = new Map() as DropTargetsMap;

    targetElements.forEach((element) => {
      const dropTargetAttribute = element.getAttribute(DROPPABLE_ATTRIBUTE);

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

  private _handleDragStart(event: PointerEvent) {
    const { shouldDrag, onDragStart } = this.config;

    const dragElement = this._dragElement!;
    const dragStartEvent = this._dragStartEvent!;

    const dragStartArgs: DragStarHandlerArgs = {
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

  private _handleDragMove(event: PointerEvent) {
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

  private _handleDragSourceEnd(event: PointerEvent) {
    const { kind: type, onDragEnd } = this.config!;

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

  private _getDropHandlerArgs(event: PointerEvent) {
    return {
      event,
      dragElement: this._dragElement!,
      dragStartEvent: this._dragStartEvent!,
      dropTargets: this._getEnabledDropTargets(),
      sourceType: this.config!.kind,
      sourceData: this._currentData!,
    } as PartialDropArgs;
  }

  private _handleTargetDragInOrMove(dropHandlerArgs: PartialDropArgs) {
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

  private _handleTargetDragOut(dropHandlerArgs: PartialDropArgs) {
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

  private _pointerDownHandler(event: PointerEvent) {
    if (!event.isPrimary) {
      return;
    }

    const { disabled, data, pointerConfig } = this.config;

    if (disabled) {
      return;
    }

    const target = event.target as HTMLElement;

    const dragElement = target.closest(`[${DRAGGABLE_ATTRIBUTE}]`) as HTMLElement;

    if (!dragElement || dragElement.getAttribute(DRAGGABLE_ATTRIBUTE) === "false") {
      return;
    }

    this._dragElement = dragElement;
    this._dragStartEvent = event;

    this._currentData =
      typeof data === "function"
        ? (data as DraggableDataFactory)({ dragElement, dragStartEvent: event })
        : data;

    const pointerMoveHandler = pointerConfig?.pointerMove ?? defaultPointerMoveHandler;
    const pointerUpHandler = pointerConfig?.pointerUp ?? defaultPointerUpHandler;
    const pointerCancelHandler = pointerConfig?.pointerCancel ?? defaultPointerCancelHandler;

    const pointerMoveDestructor = pointerMoveHandler(this._safePointerMoveHandler);
    const pointerUpDestructor = pointerUpHandler(this._safePointerUpHandler);
    const pointerCancelDestructor = pointerCancelHandler(this._safePointerCancelHandler);

    this._pointerEventsDestructor = () => {
      pointerMoveDestructor();
      pointerUpDestructor();
      pointerCancelDestructor();
    };

    this._pluginsSnapshot = this.config.plugins?.slice() ?? [];
  }

  private _populateDisableDropTargets(event: PointerEvent) {
    this._newDropTargets.forEach((dropTarget, element) => {
      const { accepts } = dropTarget.config;

      if (dropTarget.disabled) {
        disabledDropTargets.add(element);

        return;
      }

      let shouldAccept = accepts ? accepts === this.config.kind : true;

      if (Array.isArray(accepts)) {
        shouldAccept = accepts.includes(this.config.kind);
      }

      if (
        typeof accepts === "function" &&
        !disabledDropTargets.has(element) &&
        !acceptedDropTargets.has(element)
      ) {
        shouldAccept = accepts({
          kind: this.config.kind,
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

  private _pointerMoveHandler(event: PointerEvent) {
    if (!event.isPrimary) {
      return;
    }

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

  private _pointerUpHandler(event: PointerEvent) {
    if (!event.isPrimary) {
      return;
    }

    if (this._dragStartTriggered) {
      this._handleDragSourceEnd(event);
    }

    this._cleanup();
  }

  private _pointerCancelHandler(event: PointerEvent) {
    if (!event.isPrimary) {
      return;
    }

    if (this._dragStartTriggered) {
      // Simulate drag out for current targets before ending
      const dropHandlerArgs = this._getDropHandlerArgs(event);
      this._handleTargetDragOut(dropHandlerArgs);
      // Trigger drag end for the source
      this._handleDragSourceEnd(event);
    }
    this._cleanup();
  }

  private _cleanup() {
    this._pointerEventsDestructor?.();
    this._pointerEventsDestructor = null;

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

  private _safePointerMoveHandler = (event: PointerEvent) => {
    try {
      this._pointerMoveHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  private _safePointerUpHandler = (event: PointerEvent) => {
    try {
      this._pointerUpHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  private _safePointerCancelHandler = (event: PointerEvent) => {
    try {
      this._pointerCancelHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  private _safePointerDownHandler = (event: PointerEvent) => {
    try {
      this._pointerDownHandler(event);
    } catch (err) {
      this._cleanup();

      throw err;
    }
  };

  public setConfig = (config: DraggableConfig) => {
    this.config = config;
  };

  public listen = (element: HTMLElement, setAttribute = true): Destructor => {
    const pointerDownHandler = this.config.pointerConfig?.pointerDown ?? defaultPointerDownHandler;

    const pointerDownDestructor = pointerDownHandler(element, this._safePointerDownHandler);

    if (setAttribute && !element.hasAttribute(DRAGGABLE_ATTRIBUTE)) {
      element.setAttribute(DRAGGABLE_ATTRIBUTE, "true");
    }

    return () => {
      this._cleanup();

      pointerDownDestructor();

      if (setAttribute) {
        element.removeAttribute(DRAGGABLE_ATTRIBUTE);
      }
    };
  };
}

export function createDraggable<T extends DraggableConfig>(config: T) {
  return new Draggable(config);
}
