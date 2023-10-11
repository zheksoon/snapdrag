import { DROP_TARGET_ATTRIBUTE } from "./constants";
import { registeredDropTargets } from "./dragSource";
import {
  Destructor,
  DragSourceType,
  DropTargetConfig,
  IDropTarget
} from "./types";

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

  get disabled() {
    return this.config.disabled ?? false;
  }
}

export function createDropTarget<T extends Array<DragSourceType<any>>>(config: DropTargetConfig<T>) {
  return new DropTarget(config);
}
