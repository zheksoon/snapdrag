import { useState } from "react";
import { useDraggable } from "snapdrag";

export const DraggableSquare = ({ color }: { color: string }) => {
  const [text, setText] = useState("Drag me");
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color },
    move: true,
    // Callbacks are totally optional
    onDragStart({ data }) {
      // data is the own data of the draggable
      setText(`Dragging ${data.color}`);
    },
    onDragMove({ dropTargets }) {
      // Check if there are any drop targets under the pointer
      if (dropTargets.length > 0) {
        // Update the text based on the first drop target color
        setText(`Over ${dropTargets[0].data.color}`);
      } else {
        setText("Dragging...");
      }
    },
    onDragEnd({ dropTargets }) {
      // Check if the draggable was dropped on a valid target
      if (dropTargets.length > 0) {
        setText(`Dropped on ${dropTargets[0].data.color}`);
      } else {
        setText("Drag me");
      }
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  return draggable(
    <div
      className="square draggable"
      style={{ backgroundColor: color, opacity }}
    >
      {text}
    </div>
  );
};
