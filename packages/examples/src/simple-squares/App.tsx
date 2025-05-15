import { Overlay } from "snapdrag";
import { DraggableSquare } from "./DraggableSquare";
import { DroppableSquare } from "./DroppableSquare";

import "./styles.css";

export default function App() {
  return (
    <>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 100, left: 100 }}>
          <DraggableSquare color="red" />
        </div>
        <div style={{ position: "absolute", top: 300, left: 100 }}>
          <DraggableSquare color="coral" />
        </div>
        <div style={{ position: "absolute", top: 100, left: 300 }}>
          <DroppableSquare color="green" />
        </div>
        <div style={{ position: "absolute", top: 300, left: 300 }}>
          <DroppableSquare color="darkviolet" />
        </div>
      </div>
      <Overlay />
    </>
  );
}
