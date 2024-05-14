import "./styles.css";

import React, { useState, useEffect } from "react";
import { Overlay, useDraggable, useDroppable } from "../../react/src/react-new";

const DraggableSquare = ({ color }) => {
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color },
    move: true,
  });

  const opacity = isDragging ? 0.5 : 1;

  return draggable(
    <div className="square" style={{ backgroundColor: color, opacity }}>
      {isDragging ? "Dragging" : "Drag me"}
    </div>
  );
};

const DroppableSquare = ({ color }) => {
  const [text, setText] = React.useState("Drop here");

  const { droppable, hovered } = useDroppable({
    accepts: "SQUARE",
    onDrop({ data }) {
      setText(`Dropped ${data.color}`);
    },
  });

  const backgroundColor = hovered ? hovered.data.color : color;

  return droppable(
    <div className="square" style={{ backgroundColor }}>
      {text}
    </div>
  );
};

export default function App() {
  return (
    <>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 100, left: 100 }}>
          <DraggableSquare color="red" />
        </div>
        <div style={{ position: "absolute", top: 100, left: 300 }}>
          <DroppableSquare color="green" />
        </div>
      </div>
      <Overlay />
    </>
  );
}
