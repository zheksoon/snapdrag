import { MouseEventHandler } from "../types";

export function defaultMouseDownHandler(
  element: HTMLElement,
  handler: MouseEventHandler
) {
  element.addEventListener("pointerdown", handler);

  return () => {
    element.removeEventListener("pointerdown", handler);
  };
}

export function defaultMouseMoveHandler(handler: MouseEventHandler) {
  document.addEventListener("pointermove", handler);

  return () => {
    document.removeEventListener("pointermove", handler);
  };
}

export function defaultMouseUpHandler(handler: MouseEventHandler) {
  document.addEventListener("pointerup", handler);

  return () => {
    document.removeEventListener("pointerup", handler);
  };
}
