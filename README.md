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

**Snapdrag** is a library for drag-and-drop with React in the first place. I was tired of the bulky APIs other libraries offer, so decided to experiment a bit on the ergonomics and simplicity, while maintaining flexibility and customization. It's built on top of `snapdrag/core`, the universal building block for any framework or vanilla JS.

## Key Features

- **Dead** simple - just two hooks and an overlay to go
- **Super** ergonomic - no need for memoizing callbacks or config
- **Full** customization - rich event system
- **Two-way** data exchange for draggable and droppable
- **Multiple** targets at the same point - do your logic for multilayer interactions
- **No HTML5** drag-and-drop used - for good and for bad

## Installation

```bash
npm i --save snapdrag

yarn add snapdrag
```

## Show me the code!

The simplest example of two squares. A draggable square carries color in its data, droppable square reacts to the drag interaction and sets its color according to the color. When dropped, the text of the droppable square is updated.

<details>

<summary><b>DraggableSquare.tsx</b></summary>

```tsx
import { useDraggable } from "snapdrag";

export const DraggableSquare = ({ color }: { color: string }) => {
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
```

</details>

<details>
<summary><b>DroppableSquare.tsx</b></summary>

```tsx
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }: { color: string }) => {
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

</details>

<details>
<summary><b>App.tsx</b></summary>

```tsx
import { Overlay } from "snapdrag";

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

## How it works

So basically, Snapdrag has two hooks, `useDraggable` and `useDroppable`, and the `Overlay` component. The overlay must be rendered on top of the app to show the drag interactions, see the example and notes below.

### `useDraggable`

`useDraggable` hook returns an object with `draggable` and `isDragging` properties. To make it work, just wrap your component with `draggable`, and then use `isDragging` to get the drag status. The only required field in the hook config is `kind` - it defines how to differentiate the draggable from each other:

```ts
const DraggableSquare = () => {
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    // other fields are optional
  });

  return draggable(<div>{isDragging ? "dragging" : "drag me"}</div>);
};
```

**Important note:** For sure, the wrapped component should take a ref to DOM node to be draggable. If you specify another ref for the component explicitly, `draggable` will handle it, like this:

```tsx
const ref = useRef(null); // ref for your own logic

const { draggable, isDragging } = useDraggable({
  kind: "SQUARE",
});

// the ref will be populated as usual
return draggable(<div ref={ref} />);
```

Moreover, the return result of the `draggable` wrapper is just the same component (but with ref to internals). As usual, it can be wrapped in another wrapper, say, `droppable`. This allows your component to be draggable and droppable at the same time:

```tsx
// make is draggable
const { draggable, isDragging } = useDraggable({
  kind: "SQUARE", 
  move: true, 
});

// make it droppable and accept squares
const { droppable, hovered } = useDroppable({
  accepts: "SQUARE",
});

const text = isDragging ? "Dragging" : hovered && "Hovered" : "Drag me";

// the order doesn't matter
return draggable(
  droppable(<div className="square">{text}</div>)
);
```

### `useDraggable` config

`useDraggable` takes a config that carries the kind, data, and event handlers. You don't have to memoize the config and its handlers, it's fine to swap it anytime with new closures and data.

Here's a detailed description of each config field:

```ts
const { useDraggable, isDragging } = useDraggable({
  // "kind" is the type of the draggable. Drop targets specify the kinds in `accepts` field,
  // so they react only for drag interactions for this kind.
  // The kind might be a string or symbol
  kind: "SQUARE",
  // "data" is the the data associated with the draggable.
  // It's visible to drop targets when drag interaction occurs
  data: { color: "red" },
  // "shouldDrag" is an optional callback to define if the element
  // should react to drag interactions. It's executed once on drag start
  shouldDrag: ({ event, element }) => {
    // event: pointerdown DOM event
    // element: the element on which the drag interaction occurs
    // Must return `true` or `false`
    return true;
  },
  // "disabled" mean no drag at all, you know :)
  disabled: false,
  // by default, drag interaction clones the component to the overlay layer
  // "move" means that the component is moved instead of be cloned, so null is rendered instead
  move: true,
  // "component" is a callback to get a component that will be shown on drag interaction
  // instead of the current one
  component: () => <Square color="blue" />,
  // "onDragStart" is optional callback. It's called when drag interaction starts
  onDragStart: ({ event, element, data }) => {
    // event: pointerdown DOM event
    // element: the element on which the drag interaction occurred
    // data: current data of the draggable
  },
  // "onDragMove" is called on every mouse move during the interaction
  // Don't put expensive logic here
  onDragMove: ({ event, dropTargets, data, top, left }) => {
    // event: pointermove DOM event
    // dropTargets: an array of drop targets where the draggable is currently over
    // data: current data of the draggable
    // top and left: coordinates of rendered draggable element (not mouse coordinates)
  },
  // "onDragEnd" is called when drag interaction ends
  // Note that it doesn't mean the draggable was dropped on drop target
  // To check this, use "dropTargets" argument - it will be empty in this case
  onDragEnd: ({ event, data, dropTargets }) => {
    // event: pointerup DOM event
    // data: current data of the draggable
    // dropTargets: an array of drop targets where the draggable was dropped on
    // Note that it will be empty if the draggable was dropped not on drop target
  },
  // `mouseConfig` is an option from snapdrag/core
  // See the core documentation for it
  mouseConfig: undefined,
  // `plugins` is also an option from snapdrag/core
  plugins: undefined,
});
```

The `isDragging` prop from the hook is just a sugar over manually changing a state from `onDragStart` and `onDragEnd` (not exactly, it has some internal usage).

### `useDroppable`

Like `useDraggable`, `useDroppable` takes a config and returns an object with two fields: `draggable` and `hovered`. To make your component react to drop interactions, wrap it with `droppable`. To define what draggable it should accept, define the required `accepts` field. It can be a string or symbol, an array of them, or a function (see docs below):

```tsx
export const DroppableSquare = ({ color }: { color: string }) => {
  const { droppable, hovered } = useDroppable({
    accepts: "SQUARE",
    // other config fields are optional
  });

  const backgroundColor = hovered ? hovered.data.color : color;

  return droppable(
    <div className="square" style={{ backgroundColor }}></div>
  );
};
```

When the droppable is hovered by the corresponding draggable, the `hovered` returns its data and kind. Elsewhere, it's null.

### `useDroppable` config



## Author

Eugene Daragan

## License

MIT
