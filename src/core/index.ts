export { DragSource, createDragSource, dragSourceType } from "./dragSource";

export { DropTarget, createDropTarget } from "./dropTarget";

export * from "./types";


import { DragSource, createDragSource, dragSourceType } from "./dragSource";

import { DropTarget, createDropTarget } from "./dropTarget";

const SQUARE = dragSourceType<{ color: string }>("square");
const CIRCLE = dragSourceType<{ radius: number }>("circle");

const dragSource = createDragSource({
  type: SQUARE,
  data: { color: "Red" },
  onDragStart: ({ dragElement }) => {
    dragElement.innerText = "Drag start";
  },
  onDragEnd: ({ event, dragStartEvent, dragElement }) => {
    dragElement.innerText = "Drag end";

    const currentTop = parseInt(dragElement.style.top, 10);
    const currentLeft = parseInt(dragElement.style.left, 10);

    const dx = event.x - dragStartEvent.x;
    const dy = event.y - dragStartEvent.y;

    dragElement.style.top = `${currentTop + dy}px`;
    dragElement.style.left = `${currentLeft + dx}px`;
    dragElement.style.transform = ``;
  },
  onDragMove: ({ event, dragStartEvent, dragElement }) => {
    dragElement.innerText = "Drag move";

    const dx = event.x - dragStartEvent.x;
    const dy = event.y - dragStartEvent.y;

    dragElement.style.transform = `translateX(${dx}px) translateY(${dy}px)`;
  }
});

const dropTarget = createDropTarget({
    sourceTypes: [SQUARE],
    onDragIn: ({ sourceData, dropElement }) => {
      dropElement.innerText = `${sourceData.color} is started`;
    },
    onDragOut: ({ dropElement }) => {
      dropElement.innerText = `Drag out`;
    },
    onDragMove: ({ dropElement, sourceData }) => {
      dropElement.innerText = `${sourceData.color} is moved`;
    },
    onDrop: ({ dropElement, sourceData }) => {
      dropElement.innerText = `${sourceData.color} is dropped`;
    }
  });