<h2 align="center">
  ↕️ snapdrag ↔️
</h2>

<p align="center">
  <b>A simple, lightweight, and performant drag and drop library for React and vanilla JS</b>
</p>

## The Problem

Implementing drag-and-drop in vanilla JS can be a cumbersome task, often requiring a deep dive into the bulky HTML5 API. While powerful, this API can be difficult to customize and adapt, especially for touch devices.

When it comes to React-based solutions, `react-dnd` is often the go-to choice. While it offers a robust set of features, it's not without its drawbacks. One notable issue is the dependency on backends to handle the drag-and-drop logic. The most commonly used HTML5 backend comes with limitations, such as inconsistent behavior across browsers and limited support for touch interactions. Additionally, managing nested or overlapping drop targets can become complex, often requiring custom logic to handle event propagation and state management. These challenges can add layers of complexity to the code, making it less straightforward to implement a seamless and efficient drag-and-drop experience.

## Introduction
Snapdrag is a vanilla JS implementation of drag-and-drop that operates without relying on the HTML5 API. Designed to be framework-agnostic and written in pure TypeScript, this library provides a simple way to add drag-and-drop features to projects based on any framework or library.

## Key Features

- **Highly Customizable Core:** Extendable and written in pure TypeScript, offering compatibility with various frameworks and libraries.

- **High Performance:** Can handle any number of drag-and-drop targets efficiently.

- **Rich Event System:** Provides a rich set of events for fine control over drag-and-drop interactions.

- **Plugin Architecture:** Features a flexible plugin system, including a configurable auto-scroller plugin out of the box.

- **Optional React Bindings:** Supports both wrapping components and hooks, offering easy integration for React developers.

- **Lightweight:** A compact core codebase of just 350 lines, with built-in support for tree-shaking to optimize bundle size.

## API

### Drag source

Example code for drag source implementation:

```
const myDragSourceType = dragSourceType<{ name: string }>("myType");

const dragSourceConfig: DragSourceConfig<typeof myDragSourceType> = {
  // Determines whether the drag source is disabled
  disabled: false,

  // Specifies the type of the drag source
  type: myDragSourceType,

  // Data associated with the drag source
  data: { name: "example" },

  // Optional function to decide whether to start dragging
  shouldDrag: (args) => {
    return args.element.id !== "no-drag";
  },

  // Event handler for when dragging starts
  onDragStart: (args) => {
    console.log("Drag started:", args.element);
  },

  // Event handler for when dragging ends
  onDragEnd: (args) => {
    console.log("Drag ended:", args.element);
  },

  // Event handler for when dragging moves
  onDragMove: (args) => {
    console.log("Dragging:", args.element);
  },

  // Mouse event configurations
  mouseConfig: {
    mouseDown: (element, handler) => {
      // Custom mouse down logic
    },
    mouseMove: (handler) => {
      // Custom mouse move logic
    },
    mouseUp: (handler) => {
      // Custom mouse up logic
    },
  },

  // Array of plugins
  plugins: [
    {
      onDragStart: (args) => {
        // Plugin logic for drag start
      },
    },
  ],
};

const myDragSource = createDragSource(dragSourceConfig);

const destructor = myDragSource.listen(element);

destructor();
```

### Drop target


```
const dropTargetConfig: DropTargetConfig<typeof myDragSourceType> = {
  // Determines whether the drop target is disabled
  disabled: false,

  // Array of source types that this drop target can accept
  sourceTypes: [myDragSourceType],

  // Data associated with the drop target
  data: { someData: "example" },

  // Event handler for when a drag source enters the drop target
  onDragIn: (props) => {
    console.log("Drag entered:", props.dropTarget);
  },

  // Event handler for when a drag source leaves the drop target
  onDragOut: (props) => {
    console.log("Drag left:", props.dropTarget);
  },

  // Event handler for when a drag source moves over the drop target
  onDragMove: (props) => {
    console.log("Drag moving over:", props.dropTarget);
  },

  // Event handler for when a drag source is dropped on the drop target
  onDrop: (props) => {
    console.log("Dropped:", props.dropTarget);
  },
};

const myDropTarget = createDropTarget(dropTargetConfig);

const destructor = myDropTarget.listen(element);

destructor();
```


## Author

Eugene Daragan

## License

MIT
