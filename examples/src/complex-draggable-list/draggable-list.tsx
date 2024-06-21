import { useState } from "react";
import { Overlay, useDraggable, useDroppable } from "snapdrag";
import cx from "classnames";
import "./styles.css";

type Item = { text: string; index: number };

const defaultItems = [
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

function Placeholder() {
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  const { droppable } = useDroppable({
    accepts: "ITEM",
    onDragOut() {
      setPlaceholderVisible(false);
    },
  });

  return droppable(
    <div
      className={cx(
        "placeholder",
        "with-animation",
        !placeholderVisible && "collapsed"
      )}
    ></div>
  );
}

interface ItemProps {
  text: string;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
}

function Item({ text, index, moveItem }: ItemProps) {
  const [collapsed, setCollapsed] = useState(false);

  const { draggable, isDragging } = useDraggable({
    kind: "ITEM",
    data: { index },
    move: true,
    placeholder: () => <Placeholder />,
  });

  const { droppable, hovered } = useDroppable({
    accepts: "ITEM",
    onDrop({ data }) {
      if (isDragging) {
        return;
      }
      
      if (data.index !== index) {
        moveItem(data.index, index);
      }

      setCollapsed(true);

      requestAnimationFrame(() => {
        setCollapsed(false);
      });
    },
  });

  return droppable(
    draggable(
      <div className={cx("item-wrapper", isDragging && "dragging")}>
        <div
          className={cx(
            "item-placeholder",
            hovered && !isDragging && "hovered",
            collapsed ? "collapsed" : "with-animation"
          )}
        ></div>
        <div className="item">{text}</div>
      </div>
    )
  );
}

function App() {
  const [items, setItems] = useState(defaultItems);

  const { droppable } = useDroppable({
    accepts: "ITEM",
    onDrop({ data }) {
      _moveItem(data.index, items.length);
    },
  });

  const _moveItem = (fromIndex: number, toIndex: number) => {
    setItems((_items) => moveItem(_items, fromIndex, toIndex));
  };

  return (
    <>
      <div className="app">
        <div className="items-list">
          {items.map((item) => (
            <Item
              key={item.index}
              text={item.text}
              index={item.index}
              moveItem={_moveItem}
            />
          ))}
        </div>
        {droppable(<div className="last-placeholder"></div>)}
      </div>
      <Overlay />
    </>
  );
}

export default App;
