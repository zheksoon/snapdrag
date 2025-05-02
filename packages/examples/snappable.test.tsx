const THRESHOLD = 10;

const Knight = () => {
  const { draggable } = useDraggable({
    kind: "KNIGHT",
    data: { color: "white" },
    move: true,
    shouldDrag({ dragStartEvent, event, data, top, left }) {
      if (
        Math.abs(event.x - dragStartEvent.x) < THRESHOLD &&
        Math.abs(event.y - dragStartEvent.y) < THRESHOLD
      ) {
        return false;
      }

      return true;
    },
    transformCoords({ dragStartEvent, event, data, dropTargets }) {
      if (!dropTargets.length || dropTargets[0].data.type !== "SQUARE") {
        return;
      }

      const dropTarget = dropTargets[0];

      const { top, left, width, height } =
        dropTarget.element.getBoundingClientRect();

      const offsetLeft = event.x - left;
      const offsetTop = event.y - top;

      if (
        offsetLeft >= THRESHOLD &&
        offsetLeft <= width - THRESHOLD &&
        offsetTop >= THRESHOLD &&
        offsetTop <= height - THRESHOLD
      ) {
        return { top, left };
      }

      return;
    },
  });
};
