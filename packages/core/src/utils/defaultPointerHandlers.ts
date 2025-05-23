import { PointerEventHandler } from "../types";

export function defaultPointerDownHandler(element: HTMLElement, handler: PointerEventHandler) {
  element.addEventListener("pointerdown", handler);

  return () => {
    element.removeEventListener("pointerdown", handler);
  };
}

export function defaultPointerMoveHandler(handler: PointerEventHandler) {
  document.addEventListener("pointermove", handler);

  return () => {
    document.removeEventListener("pointermove", handler);
  };
}

export function defaultPointerUpHandler(handler: PointerEventHandler) {
  document.addEventListener("pointerup", handler);

  return () => {
    document.removeEventListener("pointerup", handler);
  };
}

export function defaultPointerCancelHandler(handler: PointerEventHandler) {
  document.addEventListener("pointercancel", handler);

  return () => {
    document.removeEventListener("pointercancel", handler);
  };
}
