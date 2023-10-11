<h2 align="center">
  Snap ↔️ Drag 
</h2>

<p align="center">
  <b>A simple, lightweight, and performant drag and drop library for React and vanilla JS</b>
</p>

## Introduction
**Snapdrag** is a simple, lightweight, and performant drag and drop library for React and vanilla JS. It is designed to be highly customizable and extensible, while also being easy to use out of the box. It is written in pure TypeScript, and offers compatibility with various frameworks and libraries.

Snapdrag is inspired by React DnD, but is designed to be more lightweight and flexible. It overcomes HTML5 drag and drop limitations, and provides a rich set of events for fine control over drag-and-drop interactions.

Snapdrag is a low level library, and does not provide any UI components out of the box. It is designed to be used as a building block for more complex drag-and-drop interactions. It is also designed to be framework agnostic, and can be used with any framework or library. It also provides optional React bindings for easy integration with React apps.

## Key Features

- **Extendable:** Provides a simple core API that can be extended to support any drag-and-drop use case.

- **High Performance:**: Can handle thousands of drag sources and drop targets with minimal performance impact.

- **Rich Event System:** Provides a rich set of events for fine control over drag-and-drop interactions.

- **Plugins:** Supports plugins to extend the core functionality.

- **Optional React Bindings:** Provides optional React bindings for easy integration with React apps.

- **Lightweight:** Weighs less than 5KB gzipped without minification.

## Installation

```bash
npm i --save snapdrag

yarn add snapdrag
```

## Show me the code!

Here's a simple example of a drag source and drop target:

```ts
// define a drag source type
const SQUARE = dragSourceType<{ color: string }>("square");

const dragSource = createDragSource({
  // specify the drag source type
  type: SQUARE,
  // specify the data associated with the drag source
  data: { color: "red" },
  // specify the event handlers
  onDragStart: (props) => {
    console.log("Drag started:", props.dragElement);
  },
  onDragEnd: (props) => {
    console.log("Drag ended:", props.dragElement);
  },
  onDragMove: (props) => {
    console.log("Dragging:", props.dragElement);
  },
});

const dropTarget = createDropTarget({
  // specify the drag source types that this drop target can accept
  sourceTypes: [SQUARE],
  // specify the event handlers
  onDragIn: (props) => {
    console.log("Drag entered:", props.dropElement, "with data:", props.sourceData);
  },
  onDragOut: (props) => {
    console.log("Drag left:", props.dropElement, "with data:", props.sourceData);
  },
  onDragMove: (props) => {
    console.log("Drag moving over:", props.dropElement, "with data:", props.sourceData);
  },
  onDrop: (props) => {
    console.log("Dropped:", props.dropElement);
  },
});

// listen for drag events on the drag source element
dragSource.listen(element);

// listen for drag events on the drop target element
dropTarget.listen(element);
```

This example in vanilla JS: [Link](https://codesandbox.io/s/snapdrag-example-vanilla-tcyz9z)

A bit more complex example in React: [Link](https://codesandbox.io/s/snapdrag-base-react-d2wtjf)

## React bindings

Snapdrag provides optional React bindings for easy integration with React apps. The bindings are available in the `snapdrag/react` package.

```ts
import { useDragSource, useDropTarget } from "snapdrag/react";

const Square = React.forwardRef(({ text }, ref) => {
  return <div ref="ref" className="square">{text}</div>
});

const DraggableSquare = () => {
  const [squareText, setSquareText] = useState("Drag me!");

  const withDragSource = useDragSource({
    type: SQUARE,
    data: { color: "red" },
    onDragStart: (props) => {
      setSquareText("Drag started!");
    },
    onDragEnd: (props) => {
      // some logic to settle the square position
      setSquareText("Drag me!");
    },
    onDragMove: (props) => {
      // some logic to move the square
      setSquareText("Dragging...");
    },
  });

  return withDragSource(<Square text={squareText} />);
}

const DroppableSquare = () => {
  const [squareText, setSquareText] = useState("Drop here!");

  const withDropTarget = useDropTarget({
    sourceTypes: [SQUARE],
    onDragIn: (props) => {
      setSquareText("Drag in!");
    },
    onDragOut: (props) => {
      setSquareText("Drop here!");
    },
    onDragMove: (props) => {
      setSquareText("Dragging over...");
    },
    onDrop: (props) => {
      setSquareText("Dropped!");
    },
  });

  return withDropTarget(<Square text={squareText} />);
}
```

The element wrapped by the `useDragSource` and `useDropTarget` hooks **must take a `ref` prop**. This is used to attach the drag source and drop target to the element.
Also, there is no need to memoize configs or handlers, the hooks will do it for you.
You can also change configs on the fly without any hassle.

The `useDragSource` and `useDropTarget` hooks can be nested in any order if you want to create a drag source that is also a drop target, or vice versa.

If you don't want to use hooks, you can use `DragSource` and `DropTarget` components instead:

```ts
import { DragSource, DropTarget } from "snapdrag/react";

const DraggableSquare = () => {
  const config = { ... }; // the same configuration as for hooks

  return (
    <DragSource config={config}>
      <Square text="Drag me!" />
    </DragSource>
  );
}

const DroppableSquare = () => {
  const config = { ... }; // the same configuration as for hooks

  return (
    <DropTarget config={config}>
      <Square text="Drop here!" />
    </DropTarget>
  );
}
```

The `DragSource` and `DropTarget` components can also be nested in any order.

## Documentation

### dragSourceType

```ts
const SQUARE = dragSourceType<{ color: string }>("square");
```

Creates a drag source type. A drag source type is a unique identifier for a drag source. It's used to identify the drag source when it is dragged over a drop target. It also carries the type information of the data associated with the drag source.

### createDragSource

The `createDragSource` function accepts a configuration object, and returns a drag source object.

The configuration object has the following properties:

- `disabled`: The optional boolean value that determines whether the drag source is disabled. If it's `true`, the drag source will not be draggable.

- `type`: The drag source type. This is used to identify the drag source when it is dragged over a drop target.

- `data`: The data associated with the drag source. The type of data must match that defined by the drag source type. The `data` field can be a function that returns the data. This is useful when the data needs to be dynamic. Note that the `data` function is called only once when the drag starts, and the returned data is cached for the duration of the drag. In this case, it takes the following arguments:
  - `dragElement`: The drag source element.
  
  - `dragStartEvent`: The drag start event, usually a `mousedown` or `touchstart` event.

- `onDragStart`: The drag start event handler. This is called when the drag source is dragged. It takes the following arguments:
  - `dragStartEvent: MouseEvent`: The drag start event, usually a `mousedown` or `touchstart` event.
  
  - `dragElement: HTMLElement`: The drag source element.
  
  - `data`: The data returned by the `data` field of the configuration object.

- `onDragMove`: The drag move event handler. This is called when the drag source is dragged. It takes the following arguments:
  - `event: MouseEvent`: The drag move event, usually a `mousemove` or `touchmove` event.
  
  - `dragStartEvent: MouseEvent`: The event that started the drag, usually a `mousedown` or `touchstart` event.
  
  - `dragElement: HTMLElement`: The drag source element.
  
  - `data`: The data returned by the `data` field of the configuration object.
  
  - `dropTargets: Map<HTMLElement, IDropTargget>`: The drop targets that the drag source is currently dragged over.

- `onDragEnd`: The drag end event handler. This is called when the drag source is dropped or cancelled. It takes the same arguments as the `onDragMove` event handler.

- `mouseConfig`: The optional mouse configuration object. This is used to configure the mouse events. It has the following properties (all optional):
  - `mouseDown(element: HTMLElement, handler: MouseEventHandler)`: The mouse down event handler. This is called when the drag element is listened. It should call the `handler` when the mouse down event occurs.
  
  - `mouseMove(handler: MouseEventHandler)`: The mouse move event handler. This is called when the mouse is moved. It should call the `handler` when the mouse move event occurs.
  
  - `mouseUp(handler: MouseEventHandler)`: The mouse up event handler. This is called when the mouse is released. It should call the `handler` when the mouse up event occurs.

- `plugins`: The optional array of plugins. This is used to extend the core functionality. See the [Plugins](#plugins) section for more details.

### createDropTarget

The `createDropTarget` function accepts a drop target configuration object, and returns a drop target object.

The configuration object has the following properties:

- `disabled`: The optional boolean value that determines whether the drop target is disabled. If it's `true`, the drop target will not accept any drag sources.

- `sourceTypes`: The drag source types that this drop target can accept.

- `data: any`: The optional data associated with the drop target.

- `onDragIn`: The drag in event handler. This is called when a drag source is dragged over the drop target. It takes the following arguments:
  - `event: MouseEvent`: The drag in event, usually a `mousemove` or `touchmove` event.
  
  - `sourceType`: The drag source type that is currently dragged over the drop target.
  
  - `sourceData`: The data associated with the drag source.
  
  - `dragStartEvent: MouseEvent`: The event that started the drag, usually a `mousedown` or `touchstart` event.
  
  - `dragElement: HTMLElement`: The drag source element.
  
  - `dropTarget: IDropTarget<T>`: The drop target object itself.
  
  - `dropTargets: Map<HTMLElement, IDropTargget>`: All the drop targets that the drag source is currently dragged over.
  
  - `dropElement: HTMLElement`: The drop target element.

- `onDragOut`: The drag out event handler. This is called when a drag source is dragged out of the drop target. It takes the same arguments as the `onDragIn` event handler.

- `onDragMove`: The drag move event handler. This is called when a drag source is dragged over the drop target. It takes the same arguments as the `onDragIn` event handler.

- `shouldAccept`: The optional function that determines whether the drop target should accept the drag source. 
It takes the same arguments as the `onDragIn` event handler, and returns a boolean value. 
It's called only once when the drag source is dragged over the drop target for the first time. 
If it returns `false`, the drop target will not accept the drag source, and the `onDragIn` event handler will not be called.

### Plugins

Snapdrag supports plugins to extend the core functionality. A plugin is an object that has the following properties:

- `onDragStart`: The optional drag start event handler. This is called when the drag source is dragged. It takes the same arguments as the `onDragStart` event handler of the `createDragSource` function.

- `onDragMove`: The optional drag move event handler. This is called when the drag source is dragged. It takes the same arguments as the `onDragMove` event handler of the `createDragSource` function.

- `onDragEnd`: The optional drag end event handler. This is called when the drag source is dropped or cancelled. It takes the same arguments as the `onDragEnd` event handler of the `createDragSource` function.

- `cleanup`: The optional cleanup function. This is called when the drag is ended or cancelled.

## Author

Eugene Daragan

## License

MIT
