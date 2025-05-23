import { useDraggable, useDroppable, Overlay } from "snapdrag";
import "./styles.css";

const App = () => {
  const { draggable } = useDraggable({
    kind: "SQUARE",
    data: { color: "red" },
    move: true,
  });

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    onDrop({ data }) {
      alert(`Dropped ${data.color} square`);
    },
  });

  return (
    <div className="app">
      <div className="absolute left-100">
        {draggable(<div className="square red">Drag me</div>)}
      </div>
      <div className="absolute left-300">
        {droppable(<div className="square green">Drop on me</div>)}
      </div>
      <Overlay />
    </div>
  );
};

export default App;
