import { DRAGGABLE_ATTRIBUTE, DROPPABLE_ATTRIBUTE, DROPPABLE_FORCE_ATTRIBUTE } from "./constants";
import { registeredDropTargets } from "./droppable";
import {
  Destructor,
  DraggableConfig,
  DraggableDataFactory,
  DragStarHandlerArgs,
  DropHandlerArgs,
  DropTargetsMap,
  IDraggable,
  IDroppable,
  PluginType,
} from "./types";
import {
  defaultPointerDownHandler,
  defaultPointerMoveHandler,
  defaultPointerUpHandler,
  defaultPointerCancelHandler,
} from "./utils/defaultPointerHandlers";

type PartialDropArgs = Omit<DropHandlerArgs, "dropTarget" | "dropElement">;

export class Draggable implements IDraggable {
  private _dragElement: HTMLElement | null = null;

  private _dragStartTriggered = false;

  private _dragStartEvent: PointerEvent | null = null;

  private _newDropTargets: DropTargetsMap = new Map();

  private _currentDropTargets: DropTargetsMap = new Map();

  private _pointerEventsDestructor: Destructor | null = null;

  private _pluginsSnapshot: PluginType[] = [];

  private _currentData: any | null = null;

  private _disabledDropTargets = new Set<HTMLElement>();

  private _acceptedDropTargets = new Map<HTMLElement, IDroppable>();

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
    const dragStartArgs: DragStarHandlerArgs = {
      event,
      dragElement: this._dragElement!,
      dragStartEvent: this._dragStartEvent!,
      data: this._currentData!,
    };

    if (this.config.shouldDrag && !this.config.shouldDrag(dragStartArgs)) {
      return false;
    }

    this.config.onDragStart?.(dragStartArgs);

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.onDragStart?.(dragStartArgs);
    });

    return true;
  }

  private _handleDragMove(event: PointerEvent) {
    const dragMoveArgs = {
      event,
      dragElement: this._dragElement!,
      dragStartEvent: this._dragStartEvent!,
      dropTargets: this._acceptedDropTargets,
      data: this._currentData!,
    };

    this.config.onDragMove?.(dragMoveArgs);

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.onDragMove?.(dragMoveArgs);
    });
  }

  private _handleDragSourceEnd(event: PointerEvent) {
    const dropArgs = this._getDropHandlerArgs(event);

    this._acceptedDropTargets.forEach((dropTarget, dropElement) => {
      dropTarget.config.onDrop?.({
        ...dropArgs,
        dropTarget,
        dropElement,
      });
    });

    const dragEndArgs = {
      event,
      dragElement: dropArgs.dragElement,
      dragStartEvent: dropArgs.dragStartEvent,
      dropTargets: dropArgs.dropTargets,
      data: this._currentData!,
    };

    this.config.onDragEnd?.(dragEndArgs);

    this._pluginsSnapshot.forEach((plugin) => {
      plugin.onDragEnd?.(dragEndArgs);
    });
  }

  private _getDropHandlerArgs(event: PointerEvent) {
    return {
      event,
      dragElement: this._dragElement!,
      dragStartEvent: this._dragStartEvent!,
      dropTargets: this._acceptedDropTargets,
      sourceType: this.config.kind,
      sourceData: this._currentData!,
    } as PartialDropArgs;
  }

  private _handleTargetDragInOrMove(dropHandlerArgs: PartialDropArgs) {
    this._acceptedDropTargets.forEach((dropTarget, dropElement) => {
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

      this._acceptedDropTargets.delete(dropElement);

      if (this._disabledDropTargets.delete(dropElement)) {
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

  private _populateDisabledDropTargets(event: PointerEvent) {
    this._newDropTargets.forEach((dropTarget, element) => {
      if (this._disabledDropTargets.has(element)) {
        return;
      }

      if (dropTarget.disabled || element.closest(`[${DROPPABLE_FORCE_ATTRIBUTE}="false"]`)) {
        this._disabledDropTargets.add(element);
        return;
      }

      const { accepts } = dropTarget.config;

      let shouldAccept = true;

      if (Array.isArray(accepts)) {
        shouldAccept = accepts.includes(this.config.kind);
      } else if (typeof accepts === "function") {
        if (!this._acceptedDropTargets.has(element)) {
          shouldAccept = accepts({
            kind: this.config.kind,
            data: this._currentData!,
            element: this._dragElement!,
            event,
          });
        }
      } else {
        shouldAccept = accepts === this.config.kind;
      }

      if (!shouldAccept) {
        this._disabledDropTargets.add(element);
        return;
      }

      this._acceptedDropTargets.set(element, dropTarget);
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

    this._populateDisabledDropTargets(event);

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

    this._disabledDropTargets.clear();
    this._acceptedDropTargets.clear();

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
