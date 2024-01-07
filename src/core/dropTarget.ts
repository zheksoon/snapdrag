import { DROP_TARGET_ATTRIBUTE } from "./constants";
import { Destructor, DragSourceType, DropTargetConfig, IDropTarget } from "./types";

export const registeredDropTargets = new WeakMap<HTMLElement, IDropTarget<any>>();

export const disabledDropTargets = new Set<IDropTarget<any>>();

export class DropTarget<T extends Array<DragSourceType<any>>> implements IDropTarget<T> {
  constructor(public config: DropTargetConfig<T>) {}

  public setConfig = (config: DropTargetConfig<T>) => {
    this.config = config;
  };

  public listen = (element: HTMLElement): Destructor => {
    element.setAttribute(DROP_TARGET_ATTRIBUTE, "true");

    registeredDropTargets.set(element, this);

    return () => {
      element.removeAttribute(DROP_TARGET_ATTRIBUTE);

      registeredDropTargets.delete(element);
    };
  };

  get data() {
    return this.config.data;
  }

  get disabled(): boolean {
    return this.config.disabled || disabledDropTargets.has(this);
  }
}

export function createDropTarget<T extends Array<DragSourceType<any>>>(
  config: DropTargetConfig<T>
) {
  return new DropTarget(config);
}
