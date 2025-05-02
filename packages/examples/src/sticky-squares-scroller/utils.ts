export function getMouseQuadrant(
  targetEl: HTMLElement,
  event: MouseEvent,
  size: number
) {
  const { left, top } = targetEl.getBoundingClientRect();
  const x = event.x - left;
  const y = event.y - top;
  const h = x > y;
  const v = size - x > y;

  if (h && v) {
    return "top";
  } else if (h && !v) {
    return "right";
  } else if (!h && v) {
    return "left";
  } else {
    return "bottom";
  }
}
