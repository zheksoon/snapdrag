import React from "react";
import { useDraggable, useDroppable } from "snapdrag/react";

const Square = React.forwardRef(({ top, left, color, text }, ref) => {
  return (
    <div ref={ref} className="square" style={{ top, left, backgroundColor: color }}>
      {text}
    </div>
  );
});

const DraggableSquare = ({ top, left, color }) => {
  const { draggable, isDragging } = useDraggable({
    data: { color },
  });

  const text = isDragging ? "Dragging" : "Drag me";

  return draggable(<Square top={top} left={left} color={color} text={text} />);
};

const DroppableSquare = ({ top, left, color: initialColor }) => {
  const [color, setColor] = React.useState(initialColor);
  const [text, setText] = React.useState("Drop here");

  const { droppable } = useDroppable({
    onDrop({ data }) {
      setColor(data.color);
      setText("Dropped");
    },
  });
  return droppable(<Square top={top} left={left} color={color} text={text} />);
};

export default App() {
  return (
    <>
      <DraggableSquare top={100} left={100} color="red" />
      <DroppableSquare top={100} left={300} color="green" />
    </>
  );
}