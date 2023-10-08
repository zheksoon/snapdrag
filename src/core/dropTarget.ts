import { DROP_TARGET_ATTRIBUTE } from "./constants";
import { dropTargets } from "./dragSource";
import {
  Destructor,
  DropTargetConfig,
  IDropTarget
} from "./types";

export class DropTarget<T> implements IDropTarget<T> {
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

export function createDropTarget<T extends DropTargetConfig<any>>(config: T) {
  return new DropTarget(config);
}
