import { DROPPABLE_ATTRIBUTE } from "./constants";
import { Destructor, DroppableConfig, IDroppable } from "./types";

export const registeredDropTargets = new WeakMap<HTMLElement, IDroppable>();

export class Droppable implements IDroppable {
  constructor(public config: DroppableConfig) {}

  public setConfig = (config: DroppableConfig) => {
    this.config = config;
  };

  public listen = (element: HTMLElement): Destructor => {
    element.setAttribute(DROPPABLE_ATTRIBUTE, "true");

    registeredDropTargets.set(element, this);

    return () => {
      element.removeAttribute(DROPPABLE_ATTRIBUTE);

      registeredDropTargets.delete(element);
    };
  };

  get data() {
    return this.config.data;
  }

  get disabled(): boolean {
    return !!this.config.disabled;
  }
}

export function createDroppable(config: DroppableConfig): IDroppable {
  return new Droppable(config);
}
