<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/zheksoon/snapdrag/react-concept/assets/Snapdrag.webp" alt="Snapdrag" />
</p>

<h1 align="center">
  Snapdrag 
</h1>

<p align="center">
  <b>Simplest possible drag-and-drop for React</b>
</p>

## What is it?

**Snapdrag** is a library for drag-and-drop with React in the first place. I was tired of the bulky APIs other libraries offer, so decided to experiment a bit on the ergonomics and simplicity, while maintaining flexibility and customization. It's built on top of `snapdrag/core`, the universal building block for any framework, even vanilla JS.

## Key Features

- **Dead** simple - just two hooks to go
- **Super** ergonomic - no need for memoizing callbacks or config
- **Full** customization - rich event system
- **Two-way** data exchange for draggable and droppable
- **Multiple** droppable - do your logic for multilayer interactions
- **No HTML5** drag-and-drop used - for good and for bad

## Show me the code!

```ts
import { Overlay, useDraggable, useDroppable } from "snapdrag";

const DraggableSquare = ({ color }: { color: string; }) => {
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

const DroppableSquare = ({ color }: { color: string; }) => {
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
```

<details>
<summary><b>App.ts</b></summary>

```tsx
export default function App() {
  return (
    <>
      {/* Render squares with absolute wrappers for positioning */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 100, left: 100 }}>
          <DraggableSquare color="red" />
        </div>
        <div style={{ position: "absolute", top: 100, left: 300 }}>
          <DroppableSquare color="green" />
        </div>
      </div>
      {/* Render overlay to show the dragged component */}
      <Overlay />
    </>
  );
}
```

</details>

## Installation

```bash
npm i --save snapdrag

yarn add snapdrag
```



### Auto Scroll Plugin

The auto scroll plugin automatically scrolls the scrollable parent element when the drag source is dragged near the edges of the scrollable parent element.

```ts
const scroller = createScroller({
  // specify config for x axis
  x: {
    // a margin in pixels from the edges of the scrollable parent element
    threshold: 100;
    // the scroll speed in pixels per second
    speed: 2000;
    // the power applied to the distance from the edges of the scrollable parent element
    // it makes the scroll speed increase as the drag source gets closer to the edges
    distancePower: 1.5;
  },
  // true applies the default config as above
  y: true,
})

const dragSource = createDragSource({
  // ...
  plugins: [scroller(containerElement)],
});
```

Example: TODO

## Author

Eugene Daragan

## License

MIT
