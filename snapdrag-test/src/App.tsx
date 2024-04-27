import "./styles.css";

import React, { useState, useEffect } from "react";
import { Overlay, useDraggable, useDroppable } from "../../react/src/react-new";

const DraggableSquare = ({ color }) => {
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color },
    move: false,
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div className="drag">
      {draggable(
        <div className="square" style={{ backgroundColor: color, opacity }}>
          {isDragging ? "Dragging" : "Drag me"}
        </div>
      )}
    </div>
  );
};

const DroppableSquare = ({ color }) => {
  const [text, setText] = React.useState("Drop here");

  const { droppable, hoveredBy } = useDroppable({
    accepts: ["SQUARE"],
    onDrop() {
      setText("Dropped");
    },
  });

  const backgroundColor = hoveredBy ? hoveredBy.data.color : color;

  return droppable(
    <div className="square drop" style={{ backgroundColor }}>
      {text}
    </div>
  );
};

export default function App() {
  return (
    <>
      <div style={{ position: "relative" }}>
        <DraggableSquare color="red" />
        <DroppableSquare color="green" />
      </div>
      <Overlay />
    </>
  );
}
