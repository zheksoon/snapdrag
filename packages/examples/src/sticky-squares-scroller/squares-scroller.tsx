import React, { useEffect, useState } from "react";
import "./styles.css";

import { SquareModel, squares } from "./models";
import { Square } from "./Square";
import { getMouseQuadrant } from "./utils";

import { Overlay, useDraggable, useDroppable } from "snapdrag";
import { createScroller } from "snapdrag/plugins";

const borderWidth = "5px";

function getBorderStyle(position: string) {
  const style = {
    borderColor: "red",
    borderStyle: "solid",
  } as React.CSSProperties;

  switch (position) {
    case "top":
      style.borderTopWidth = borderWidth;
      break;
    case "right":
      style.borderRightWidth = borderWidth;
      break;
    case "left":
      style.borderLeftWidth = borderWidth;
      break;
    case "bottom":
      style.borderBottomWidth = borderWidth;
      break;
    default:
  }
  return style;
}

// Create a scroller plugin
// It returns a function that takes a container element
// This function can be called with new container each time
// in the render loop
const scroller = createScroller({
  x: { threshold: 300 },
  y: { threshold: 300 },
});

function TargetSquare({ model }: { model: SquareModel }) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);
  const [opacity, setOpacity] = useState(1.0);

  // Do a trick - at the moment of render the canvas element
  // might not be available.
  // Set it only after the render, so it will update
  // the draggable scroller with corrent element.
  const [canvasEl, setCanvasEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setCanvasEl(document.getElementById("canvas"));
  }, []);

  const { draggable } = useDraggable({
    kind: "SQUARE",
    data: { model },
    move: true,
    onDragStart() {
      setOpacity(0.8);
    },
    onDragEnd() {
      setOpacity(1.0);
    },
    // Attach plugin to the draggable, so it will react
    // to its drag events and update the scroll position
    plugins: [scroller(canvasEl!)],
  });

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    data: { model },
    onDragOut: () => {
      setStyle(null);
    },
    onDragMove: ({ event, dropElement }) => {
      const position = getMouseQuadrant(dropElement, event, 100);
      const borderStyle = getBorderStyle(position);
      setStyle(borderStyle);
    },
    onDrop: ({ data, event, dropElement }) => {
      const targetModel = data.model;
      const position = getMouseQuadrant(dropElement, event, 100);

      // update the draggable model position
      // based on the position of the drop element
      switch (position) {
        case "top":
          targetModel.x = model.x;
          targetModel.y = model.y - 100;
          break;
        case "bottom":
          targetModel.x = model.x;
          targetModel.y = model.y + 100;
          break;
        case "left":
          targetModel.x = model.x - 100;
          targetModel.y = model.y;
          break;
        case "right":
          targetModel.x = model.x + 100;
          targetModel.y = model.y;
          break;
      }

      setStyle(null);
    },
  });

  return (
    <div style={{ position: "absolute", top: model.y, left: model.x }}>
      {draggable(
        droppable(<Square model={model} style={{ ...style, opacity }} />)!
      )}
    </div>
  );
}

function Canvas() {
  const height = Math.max(...squares.map((sq) => sq.y));
  const width = Math.max(...squares.map((sq) => sq.x));

  return (
    // canvas is scrollable
    <div className="canvas" id="canvas">
      {/* canvasInner is bigger size than the canvas viewport */}
      <div className="canvasInner" style={{ width, height }}>
        {squares.map((model) => (
          <TargetSquare key={model.index} model={model} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <Canvas />
      <Overlay />
    </div>
  );
}
