import { useState } from "react";
import { Overlay, useDraggable, useDroppable } from "../../../react";
import cx from "classnames";
import "./styles.css";

type Item = { text: string; index: number };

const defaultItems: Item[] = [
  { text: "Learn React", index: 0 },
  { text: "Build a To-Do App", index: 1 },
  { text: "Read about Hooks", index: 2 },
  { text: "Write Unit Tests", index: 3 },
  { text: "Explore Redux", index: 4 },
  { text: "Style Components", index: 5 },
  { text: "Deploy to Netlify", index: 6 },
  { text: "Optimize Performance", index: 7 },
  { text: "Implement DnD", index: 8 },
  { text: "Review Code", index: 9 },
];

function moveItem(items: Item[], from: number, to: number) {
  return items
    .map((item) => (item.index === from ? { ...item, index: to - 0.5 } : item))
    .sort((a, b) => a.index - b.index)
    .map((item, index) => ({ ...item, index }));
}

interface ItemProps {
  text: string;
  index: number;
  moveItem(fromIndex: number, toIndex: number): void;
}

function Item({ text, index, moveItem }: ItemProps) {
  const { draggable, isDragging } = useDraggable({
    kind: "ITEM",
    data: { index },
    move: true,
  });

  const { droppable, hovered } = useDroppable({
    accepts: "ITEM",
    onDrop({ data }) {
      if (!isDragging && data.index !== index) {
        moveItem(data.index, index);
      }
    },
  });

  return droppable(
    draggable(
      <div className={cx("item-wrapper", isDragging && "dragging")}>
        {hovered && <div className="dropline"></div>}
        <div className="item">{text}</div>
      </div>
    )
  );
}

function App() {
  const [items, setItems] = useState(defaultItems);

  const _moveItem = (fromIndex: number, toIndex: number) => {
    setItems((_items) => moveItem(_items, fromIndex, toIndex));
  };

  return (
    <>
      <div className="app">
        {items.map((item) => (
          <Item
            key={item.index}
            text={item.text}
            index={item.index}
            moveItem={_moveItem}
          />
        ))}
      </div>
      <Overlay />
    </>
  );
}

export default App;
