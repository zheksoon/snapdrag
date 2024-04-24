import "./styles.css";

import React, { useState, useEffect } from "react";
import { useDraggable, useDroppable, Overlay } from "./concept";

const DraggableSquare = ({ color }) => {
  const { draggable, isDragging } = useDraggable({
    type: "SQUARE",
    data: { color: "red" },
  });

  const opacity = isDragging ? 0.5 : 1;

  return draggable(
    <div className="square" style={{ backgroundColor: color, opacity }}>
      {isDragging ? "Dragging" : "Drag me"}
    </div>
  );
};

const DroppableSquare = ({ color: initialColor }) => {
  const [color, setColor] = React.useState(initialColor);
  const [text, setText] = React.useState("Drop here");

  const { droppable } = useDroppable({
    sourceTypes: ["SQUARE"],
    onDragIn({ data }) {
      setColor(data.color);
      setText("Dragged in");
    },
    onDragOut() {
      setColor(initialColor);
      setText("Drop here");
    },
    onDrop({ data }) {
      setText("Dropped");
    },
  });

  return droppable(
    <div className="square" style={{ backgroundColor: color }}>
      {text}
    </div>
  );
};

export default App = () => {
  return (
    <>
      <div style={{ position: "relative" }}>
        <DraggableSquare top={100} left={100} color="red" />
        <DroppableSquare top={100} left={300} color="green" />
      </div>
      <Overlay />
    </>
  );
};
