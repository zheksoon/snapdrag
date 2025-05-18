import { useState } from "react";
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }: { color: string }) => {
  const [text, setText] = useState("Drop here");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    data: { color },
    // Optional callbacks
    onDragIn({ data }) {
      // Some draggable is hovering over this droppable
      // data is the data of the draggable
      setText(`Hovered over ${data.color}`);
    },
    onDragOut() {
      // The draggable is no longer hovering over this droppable
      setText("Drop here");
    },
    onDrop({ data }) {
      // Finally, the draggable is dropped on this droppable
      setText(`Dropped ${data.color}`);
    },
  });

  return droppable(
    <div className="square droppable" style={{ backgroundColor: color }}>
      {text}
    </div>
  );
};
