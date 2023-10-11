<h2 align="center">
  Snap ↔️ Drag 
</h2>

<p align="center">
  <b>A simple, lightweight, and performant drag and drop library for React and vanilla JS</b>
</p>

## Introduction
**Snapdrag** is a simple, lightweight, and performant drag and drop library for React and vanilla JS. It is designed to be highly customizable and extensible, while also being easy to use out of the box. It is written in pure TypeScript, and offers compatibility with various frameworks and libraries.

## Key Features

- **Extendable:** Provides a simple core API that can be extended to support any drag-and-drop use case.

- **High Performance:**: Can handle thousands of drag sources and drop targets with minimal performance impact.

- **Rich Event System:** Provides a rich set of events for fine control over drag-and-drop interactions.

- **Plugins:** Supports plugins to extend the core functionality.

- **Optional React Bindings:** Provides optional React bindings for easy integration with React apps.

- **Lightweight:** Weighs less than 5KB gzipped.

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

This example is vanilla JS: [Link](https://codesandbox.io/s/snapdrag-example-vanilla-tcyz9z)

A bit more complex example in React: [Link](https://codesandbox.io/s/snapdrag-base-react-d2wtjf)

## Documentation

WIP

## Author

Eugene Daragan

## License

MIT
