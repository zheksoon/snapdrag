import { UIEventHandler } from "../types";


export function defaultMouseDownHandler(element: HTMLElement, handler: UIEventHandler) {
  element.addEventListener("pointerdown", handler);

  return () => {
    element.removeEventListener("pointerdown", handler);
  };
}

export function defaultMouseMoveHandler(handler: UIEventHandler) {
  document.addEventListener("pointermove", handler);

  return () => {
    document.removeEventListener("pointermove", handler);
  };
}

export function defaultMouseUpHandler(handler: UIEventHandler) {
  document.addEventListener("pointerup", handler);

  return () => {
    document.removeEventListener("pointerup", handler);
  };
}
