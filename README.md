<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/Snapdrag.webp" alt="Snapdrag" />
</p>

<h1 align="center">
  Snapdrag 
</h1>

<p align="center">
  <b>⚡️ Simple yet powerful drag-and-drop for React and Vanilla JS ⚡️</b>
</p>

[![Quality Check](https://github.com/zheksoon/snapdrag/actions/workflows/quality-check.yml/badge.svg)](https://github.com/zheksoon/snapdrag/actions/workflows/quality-check.yml)
[![npm version](https://badge.fury.io/js/snapdrag.svg)](https://badge.fury.io/js/snapdrag)
[![npm bundle size](https://img.shields.io/bundlephobia/min/snapdrag)](https://bundlephobia.com/result?p=snapdrag)

## What is Snapdrag?

**Snapdrag** is primarily a drag-and-drop library for React. Frustrated with the bulky APIs offered by other libraries, I developed Snapdrag to focus on ergonomics and simplicity while maintaining flexibility and customization. It’s built on top of snapdrag/core, a universal building block suitable for any framework and vanilla JavaScript.

## Key Features

- **Extremely** simple—just use the useDraggable and useDroppable hooks, and the Overlay component to get started
- **Highly** ergonomic—no need to memoize callbacks or configurations
- **Fully** customizable—rich event system
- **Two-way** data exchange between draggable and droppable components
- **Supports multiple** drop targets at the same point—enabling multilayer interactions
- **No reliance on HTML5** drag-and-drop—offering better control and consistency across browsers

## Table of Contents

- [Installation](#installation)
- [Show Me the code!](#show-me-the-code)
- [How It works](#how-it-works)
- [`useDraggable`](#usedraggable)
  - [`onDragStart`](#ondragstart)
  - [`onDragMove`](#ondragmove)
  - [`onDragEnd`](#ondragend)
- [`useDroppable`](#usedroppable)
  - [`onDragIn`](#ondragin)
  - [`onDragMove`](#ondragmove-1)
  - [`onDragOut`](#ondragout)
  - [`onDrop`](#ondrop)
- [Examples](#examples)
- [`useDraggable` configuration](#usedraggable-configuration)
  - [Detailed description](#detailed-description)
  - [Full example](#full-example)
- [`useDroppable` configuration](#usedroppable-configuration)
  - [Detailed description](#detailed-description-1)
  - [Full Example](#full-example-1)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm i --save snapdrag

yarn add snapdrag
```

Show Me the Code!

Here is the simplest example involving two squares. The draggable square carries a color in its data. The droppable square reacts to the drag interaction by setting its color according to the draggable’s color. When dropped, the text of the droppable square is updated.

<img width="400" alt="Simple drag-and-drop squares" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-squares.avif" />

The `DraggableSquare` component uses the `useDraggable` hook to make it draggable. The hook’s configuration defines the kind and the data of the draggable. The draggable wrapper is used to make the component actually draggable:

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

The `DroppableSquare` component uses the `useDroppable` hook to make it droppable. The configuration defines the accepted kind and the callback for the `onDrop` event. The droppable wrapper is used to make the component droppable. The `hovered` property is used to get the data of the draggable when it’s hovered over:

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

The `App` component renders the draggable and droppable squares. The draggable square is wrapped in an absolute wrapper to position it on the page. The `Overlay` component is rendered to show the dragged component:

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

This example on **CodeSandbox**: https://codesandbox.io/p/sandbox/snapdrag-simple-squares-8rw96s

See more examples in the `examples` folder and in the [Examples](examples) section.

<hr />

## How t works

Under the hood, Snapdrag attaches a pointerdown event listener to draggable elements. After it’s triggered, it tracks `pointermove` events on the document until `pointerup` occurs. On every `pointermove` event, it checks elements under the cursor using `document.elementsFromPoint()`, and then handles the logic of tracking current and new droppables at that point.

Draggables aren’t bound to the initial configuration, so it can be changed at any time, making it very flexible to use new closures, settings, etc. The React bindings wrap this core logic and adapt some arguments to be more convenient.

An important point for React is the draggable/droppable wrappers—they keep the original ref to the React element and populate it as usual, making it fully transparent and easy to compose.

<hr />

## `useDraggable`

The useDraggable hook returns an object with draggable and isDragging properties. To use it, wrap your component with draggable, and use isDragging to get the drag status. The only required field in the hook configuration is kind, which defines how to differentiate the draggable from others:

```tsx
const DraggableSquare = () => {
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    // other fields are optional
  });

  return draggable(<div>{isDragging ? "Dragging" : "Drag me"}</div>);
};
```

**Important Note**: The wrapped component must accept a `ref` to the DOM node to be draggable. If you specify another `ref` for the component explicitly, draggable will handle it correctly, like this:

```tsx
const ref = useRef(null); // ref for your own logic

const { draggable, isDragging } = useDraggable({
  kind: "SQUARE",
});

// the ref will be populated as usual
return draggable(<div ref={ref} />);
```

Moreover, the result of the `draggable` wrapper is just the same component (but with a ref to internals). As usual, it can be wrapped in another wrapper, such as `droppable`. This allows your component to be draggable and droppable at the same time:

```tsx
const { draggable, isDragging } = useDraggable({
  kind: "SQUARE",
});

const { droppable, hovered } = useDroppable({
  accepts: "SQUARE",
});

const text = isDragging ? "Dragging" : hovered ? "Hovered" : "Drag me";

// the order doesn't matter
return draggable(droppable(<div className="square">{text}</div>));
```

<hr />

## Draggable Lifecycle

The draggable configuration has callbacks for different events in the lifecycle of the drag interaction.

There are three of them: `onDragStart`, `onDragMove`, and `onDragEnd`.

<hr />

### `onDragStart`

The callback is called when the drag interaction starts — this means the user clicked and started to move the element. In more detail, it’s called after the `shouldDrag` function returns `true`. Here’s how it looks in the code:

```tsx
const Square = () => {
  const { draggable } = useDraggable({
    kind: "SQUARE",
    data: { color: "red" },
    onDragStart(props) {
      console.log("Drag started");
    },
  });
};
```

The `props` here contain data related to the interaction: `data`, `event`, `dragStartEvent`, and `element`. It’s quite intuitive — data is the `data` field in the configuration (or the result of the data factory function if specified), `event` is the PointerEvent from the `pointermove` handler, and the `dragStartEvent` is the `PointerEvent` from the `pointerdown` event.

The `dragStartEvent` can be used to calculate relative positions from the current event. The element is the `HTMLElement`.

This callback is also [described later](#ondragstart-1) in the configuration documentation.

<hr />

### `onDragMove`

This callback is executed on every pointermove event. As you can imagine, it’s time-sensitive, so try to avoid putting expensive logic here.

Example:

```ts
const Square = () => {
  const { draggable } = useDraggable({
    kind: "SQUARE",
    data: { color: "red" },
    onDragMove(props) {
      console.log("Drag moving");
    },
  });
};
```

Props contain all the same data as in the onDragStart callback, but with some additions:

- `dropTargets` is an array containing data about current drop targets under the cursor. It’s an array, so if the current draggable is over multiple of them, they will be here. Each drop target is represented as an object with data and element fields. The `data` is the data field from the `useDroppable` configuration, allowing data exchange between draggable and droppable components. The `element` is the droppable element.

- `top` and `left` are the screen coordinates of the draggable.

To get more of the idea of dropTargets and using their data, see the Data Transfer from Droppable to Draggable example.

## Example - Data Transfer from Droppable to Draggable

Let’s modify the draggable squares example to show how data can be transferred from the droppable to the draggable in the `onDragMove` callback.

First, we will change the` DraggableSquare.tsx` to the following:

<details>
  <summary><b>DraggableSquare.tsx</b></summary>

```tsx
import { useState } from "react";
import { useDraggable } from "snapdrag";

export const DraggableSquare = ({ color: initialColor }: { color: string }) => {
  const [color, setColor] = useState(initialColor);

  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color },
    move: true,
    onDragMove({ dropTargets }) {
      const color = dropTargets.length ? dropTargets[0].data.color : initialColor;

      setColor(color);
    },
    onDragEnd(args) {
      setColor(initialColor);
    },
  });

  const opacity = isDragging ? 0.9 : 1;

  return draggable(
    <div className="square" style={{ backgroundColor: color, opacity }}>
      {isDragging ? "Dragging" : "Drag me"}
    </div>
  );
};
```

</details>

Here we have `onDragMove` and `onDragEnd` callbacks that control the color of the draggable square. When there is a drop target under the cursor (so `dropTargets.length > 0`), we get the color from the first drop target’s data field.

The `DroppableSquare.tsx` is mostly the same, but we add the data there and remove color matching logic for convenience:

<details>
  <summary><b>DroppableSquare.tsx</b></summary>

```tsx
import React from "react";
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }: { color: string }) => {
  const [text, setText] = React.useState("Drop here");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    data: { color },
    onDrop({ data }) {
      setText(`Dropped ${data.color}`);
    },
  });

  return droppable(
    <div className="square" style={{ backgroundColor: color }}>
      {text}
    </div>
  );
};
```

</details>

<details>
  <summary><b>The result looks like this:</b></summary>

<img width="400" alt="Draggable squares color matching" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-draggable-color.avif" />
</details>

**CodeSandbox link:** https://codesandbox.io/p/sandbox/snapdrag-squares-draggable-color-q4v3x7

<hr />

### `onDragEnd`

`onDragEnd` is triggered when the drag interaction ends — most commonly on a `pointerup` event.

There are two outcomes for the end — the draggable was dropped on drop target(s) or not. Depending on this, the `dropTargets` argument will be populated accordingly, as in the `onDragMove handler.

More about the props the of the hander you can read in the [configuration description](#ondragend-1).

<hr />

## `useDroppable`

Like `useDraggable`, `useDroppable` takes a configuration and returns an object with two fields: `droppable` and `hovered`. To make your component react to drop interactions, wrap it with `droppable`. To define what draggable it should accept, define the required `accepts` field. It can be a string or symbol, an array of them, or a function (see documentation below):

```tsx
export const DroppableSquare = ({ color }: { color: string }) => {
  const { droppable, hovered } = useDroppable({
    accepts: "SQUARE",
    // other configuration fields are optional
  });

  const backgroundColor = hovered ? hovered.data.color : color;

  return droppable(<div className="square" style={{ backgroundColor }}></div>);
};
```

When the droppable is hovered by the draggable, `hovered returns its data and kind; otherwise, it’s null.

Like the `draggable` wrapper, the component can be wrapped both in `draggable` and `droppable`; the order doesn't matter.

<hr />

## Droppable lifecycyle

The configuration of `useDroppable` can have the following callbacks: `onDragIn`, `onDragOut`, `onDragMove`, and `onDrop`.

Let’s take a look at each of them.

<hr />

### `onDragIn`

This callback is called when a draggable item enters the area of the drop target. It’s executed once and can be used for different interactions like changing color, setting some state, etc.

Here's an example:

```tsx
import { useState } from "react";
import { useDroppable } from "snapdrag";

const DroppableSquare = () => {
  const [text, setText] = useState("Drag on me!");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    onDragIn({ data }) {
      setText(`Dragged in ${data.color}`);
    },
    onDragOut({ data }) {
      setText(`Dragged out ${data.color}`);
    },
  });
};
```

Here we add `onDragIn` and `onDragOut` handlers to set text when a draggable square enters and leaves the droppable area.

<hr />

### `onDragMove`

`onDragMove` is called on every `pointermove` event over the drop target. It can be used for customization of the drop target’s look during the drag interaction.

### Example - Dynamic Border on DroppableSquare

Let’s modify the squares example to render a border on `DroppableSquare` depending on the position of the draggable.

The `DraggableSquare` will remain the same; the only changes will be in the `DroppableSquare component.

Here it is:

<details>
  <summary><b>DroppableSquare.tsx</b></summary>

```tsx
import { useState } from "react";
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }: { color: string }) => {
  const [text, setText] = useState("Drop here");
  const [borderPosition, setBorderPosition] = useState("");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    onDragMove({ event, dropElement }) {
      const { top, left, height } = dropElement.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;

      if (x / y < 1.0) {
        if (x / (height - y) < 1.0) {
          setBorderPosition("borderLeft");
        } else {
          setBorderPosition("borderBottom");
        }
      } else {
        if (x / (height - y) < 1.0) {
          setBorderPosition("borderTop");
        } else {
          setBorderPosition("borderRight");
        }
      }
    },
    onDragOut() {
      setBorderPosition("");
    },
    onDrop({ data }) {
      setText(`Dropped ${data.color}`);
      setBorderPosition("");
    },
  });

  const style = {
    backgroundColor: color,
    [borderPosition]: "10px solid red",
  };

  return droppable(
    <div className="square" style={style}>
      {text}
    </div>
  );
};
```

</details>

Here we add `borderPosition` state, and in `onDragMove` handler we calculate a quadrant of the droppable square where we will be showing the border. On `onDragOut` and `onDrop` events we remove the border.

<details>
  <summary><b>The result looks like this:</b></summary>

<img width="400" alt="Draggable squares with dynamic border" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-dynamic-border.avif" />
</details>

**CodeSandbox link:** https://codesandbox.io/p/sandbox/snapdrag-squares-dynamic-border-rcwn7m

<hr />

### `onDragOut`

This callback is called when the draggable leaves the drop target area. It’s often used in conjunction with `onDragIn` to perform opposite actions, like restoring initial state, color, or text.

You can see its usage in the previous example with dynamic borders — it’s used there to remove borders after the cursor leaves the droppable square.

Arguments are mostly the same as in the previous callbacks; more details are in the [config docs](#ondragout-1).

<hr />

### `onDrop`

This is the most commonly used callback—it defines the reaction of the drop target to the end of a drop operation. Arguments are the same as in [other callbacks](#ondragin-1), nothing new here.

All the examples contain some usage of this callback, so feel free to check them out.

<hr />

## Examples

Here's some examples starting from the simplest to the most advanced.

<hr />

### Simple squares

<details>
  <summary><b>How it looks:</b></summary>
  <img alt="Simple squares" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-squares.avif" />
</details>

This example was shown earlier in the [Show me the code!](#show-me-the-code) section. It demonstrates the basic principles of drag-and-drop: `onDraggable` and `onDroppable` hooks, `kind` and `acceps` values, data transfer, and the `onDrop` handler.

**CodeSandbox link:** https://codesandbox.io/p/sandbox/snapdrag-simple-squares-8rw96s

<hr />

### Simple list

<details>
  <summary><b>How it looks like</b></summary>
  <img alt="simple list" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-simple-list.avif" />
</details>

This example shows a simple drag-and-drop list with item reordering. There are no animations; the place where the item should be inserted is highlighted with a blue line. The handlers used are the same as in the squares example — `onDrop`, `data`, and the hooks.

**CodeSandbox link:** https://codesandbox.io/p/sandbox/snapdrag-simple-list-w4njk5

### Advanced List with Animations

<details>
  <summary><b>How it looks:</b></summary>
  <img alt="Advanced list" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-advanced-list.avif" />
</details>

The advanced list example is a more sophisticated version of the draggable list. It introduces smooth animations and a bottom drop area for appending an item as the last. The animations are done using CSS transitions—on hover, the animated placeholder appears on top of the item, creating an empty space for the drop. After the drop, the placeholder immediately collapses, so the dropped item is integrated into its place without visible artifacts.

**CodeSandbox link:** https://codesandbox.io/p/sandbox/snapdrag-advanced-list-5p44wd

<hr />

### Kanban ashboard

<details>
  <summary><b>How it looks:</b></summary>
  <img alt="Kanban dashboard" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-kanban.avif" />
</details>

This is the most advanced example that demonstrates what can be achieved with Snapdrag. It includes multiple drop targets, data exchange, dynamic accepts, smooth animations, item addition and removal, separate projects, touch support, drag threshold — you name it. It might sound a bit complex, but all the drag logic and layout is done in 200 lines (excluding state management, initial data, and styled components). Just check it out and see how simple it can be!

**CodeSandbox link:** https://codesandbox.io/p/sandbox/snapdrag-kanban-board-jlj4wc

<hr />

## `useDraggable` Configuration

The `useDraggable` hook takes a configuration object that allows you to customize its behavior. Below are the configuration options available:

| Option                        | Type                                          | Description                                                                                    |
| ----------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`kind`](#kind)               | `string` or `symbol`                          | Required                                                                                       | Defines the type of the draggable. Must be unique to differentiate it from other draggables. |
| [`data`](#data)               | `object` or `function`                        | Data associated with the draggable. It can also be a function returning the data object.       |
| [`disabled`](#disabled)       | `boolean`                                     | Disables the drag functionality when set to true.                                              |
| [`move`](#move)               | `boolean`                                     | Moves the component instead of cloning it to the overlay layer.                                |
| [`component`](#component)     | `function`                                    | Function that returns a component to be shown as the draggable.                                |
| [`placeholder`](#placeholder) | `function`                                    | Function that returns a placeholder component to be shown in place of the draggable component. |
| [`offset`](#offset)           | `{ top: number, left: number }` or `function` | Determines the offset of the dragging component relative to the cursor position.               |

**Callbacks**:

| Callback                        | Description                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`shouldDrag`](#shoulddrag)     | Function to determine if the element should react to drag interactions. Must return `true` or `false`. |
| [`onDragStart`](#ondragstart-1) | Called when the drag interaction starts.                                                               |
| [`onDragMove`](#ondragmove-2)   | Called on every mouse move during the drag interaction.                                                |
| [`onDragEnd`](#ondragend-1)     | Called when the drag interaction ends.                                                                 |

<hr />

### Detailed description

#### `kind`

Defines the type of the draggable item. It must be a unique string or symbol.

```tsx
const { draggable, isDragging } = useDraggable({
  kind: "SQUARE",
});
```

#### `data`

Data associated with the draggable item. It can be a static object or a function returning the data object.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  data: { color: "red" }, // Static object
});

const { draggable } = useDraggable({
  kind: "SQUARE",
  data: ({ dragElement, dragStartEvent }) => ({ color: "red" }), // Function
});
```

- `dragElement` is the `HTMLElement` being dragged.
- `dragStartEvent` is the `PointerEvent` that started the drag interaction (from the `pointerdown` handler).

#### `disabled`

Disables the drag functionality when set to true.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  disabled: true,
});
```

#### `move`

Moves the component instead of cloning it to the overlay layer.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  move: true,
});
```

If `move` is false or not defined, the draggable component is cloned to the overlay layer, and the original component is shown as is.

Also, it’s important to note that the original component will not receive prop updates during the drag interaction — they are all applied to the dragging component.

`move` is ignored when the `placeholder` option is specified.

#### `component`

A function that returns a component to be shown as the draggable.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  component: ({ data, props }) => <Square color="blue" />,
});
```

If specified, it will replace the dragging component with the one returned by the function.

- `data` is the data associated with the draggable.
- `props` are the props of the draggable component.

The `component` function is called on every prop update, so you can use it to update the draggable component based on it.

#### `placeholder`

A function that returns a placeholder component to be shown in place of the draggable component. When specified, the move option is ignored.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  placeholder: ({ data, props }) => <Square color="gray" />,
});
```

If specified, the placeholder component is shown in place of the draggable component when it's being dragged.

It's also called on every props update, so you can use it to update the placeholder component based on it.

#### `offset`

Determines the offset of the dragging component relative to the cursor position. It can be a static object or a function.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  offset: { top: 0, left: 0 }, // Static object
});

const { draggable } = useDraggable({
  kind: "SQUARE",
  offset: ({ element, event, data }) => {
    return { top: 0, left: 0 }; // Function
  },
});
```

Note: Offset is calculated once when the drag interaction starts. It’s the distance between the cursor position and the top-left corner of the dragging component. If not specified, it’s computed so that the component’s position matches its rendered position before the drag.

### Callbacks

#### `shouldDrag`

Function to determine if the element should react to drag interactions. Must return `true` or `false`.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  shouldDrag: ({ event, dragStartEvent, element, data }) => {
    return true;
  },
});
```

`shouldDrag` is called on every mouse move during the drag interaction until it returns `true` or the drag interaction ends. It’s useful for adding a threshold or some other condition to start the drag interaction.

Arguments:

- `event` is the `PointerEvent` from the `pointermove` handler.
- `dragStartEvent` is the `PointerEvent` from the `pointerdown` handler.
- `element` is the element on which the drag interaction occurs.
- `data` is the data associated with the draggable.

#### `onDragStart`

Called when the drag interaction starts.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragStart: ({ event, dragStartEvent, element, data }) => {
    console.log("Drag started", data);
  },
});
```

The callback is an important place to perform initial setup or calculations before the drag interaction starts.

Arguments:

- `event` is the `PointerEvent` from the `pointermove` handler.
- `dragStartEvent` is the `PointerEvent` from the `pointerdown` handler.
- `element` is the element on which the drag interaction occurs.
- `data` is the data associated with the draggable.

Note: `event` here is different from `dragStartEvent` because the `onDragStart` is called only when `shouldDrag` returns `true`, so the `event` is the first `pointermove` event after that.

#### `onDragMove`

Called on every mouse move during the drag interaction. Avoid putting expensive logic here.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragMove: ({ event, dragStartEvent, element, data, dropTargets, top, left }) => {
    console.log("Dragging", data);
  },
});
```

The callback is called on every mouse move during the drag interaction. It’s not recommended to put expensive logic here because it’s called frequently.

Arguments are the same as in `onDragStart` with some additions:

- `dropTargets` is an array of drop targets where the draggable is currently over. Each drop target is an object with:
  - `element` is the drop target element.
  - `data` is the data associated with the drop target.
- top and left are the coordinates of the rendered draggable element relative to the viewport (not mouse coordinates).

#### `onDragEnd`

Called when the drag interaction ends. `dropTargets` will be an empty array if the draggable wasn’t dropped on any drop target.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragEnd: ({ event, dragStartEvent, element, data, dropTargets }) => {
    console.log("Drag ended", data);
  },
});
```

<hr />

### Full Example

Here’s a complete example demonstrating the use of all the configuration options:

```tsx
import { useDraggable } from "snapdrag";

const DraggableSquare = () => {
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color: "red" },
    shouldDrag: ({ event, dragStartEvent, element, data }) => true,
    disabled: false,
    move: true,
    component: ({ data }) => <Square color="blue" />,
    placeholder: ({ data }) => <Square color="gray" />,
    offset: { top: 0, left: 0 },
    onDragStart: ({ event, dragStartEvent, element, data }) => {
      console.log("Drag started", data);
    },
    onDragMove: ({ event, dragStartEvent, element, data, dropTargets, top, left }) => {
      console.log("Dragging", data);
    },
    onDragEnd: ({ event, dragStartEvent, element, data, dropTargets }) => {
      console.log("Drag ended", data);
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  return draggable(
    <div className="square" style={{ backgroundColor: "red", opacity }}>
      {isDragging ? "Dragging" : "Drag me"}
    </div>
  );
};
```

<hr />

## `useDroppable` Configuration

Here's a brief description of the configuration fields:

| Option                    | Type                                       | Description                                                                    |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| [`accepts`](#accepts)     | `string`, `symbol`, `array`, or `function` | Required. Defines the kinds of draggable items this droppable area can accept. |
| [`data`](#data-1)         | `object`                                   | Data associated with the droppable area.                                       |
| [`disabled`](#disabled-1) | `boolean`                                  | Disables the drop functionality when set to true.                              |

**Callbacks**:

| Callback                      | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| [`onDragIn`](#ondragin-1)     | Called when a draggable item of an accepted kind enters the droppable area. |
| [`onDragOut`](#ondragout-1)   | Called when a draggable item leaves the droppable area.                     |
| [`onDragMove`](#ondragmove-3) | Called when a draggable item moves within the droppable area.               |
| [`onDrop`](#ondrop-1)         | Called when a draggable item is dropped within the droppable area.          |

<hr />

### Detailed Description

#### `accepts`

Defines the kinds of draggable items this droppable area can accept. It can be a single kind, an array of kinds, or a function.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
});
// or
const { droppable } = useDroppable({
  accepts: ["SQUARE", "CIRCLE"],
});
// or
const { droppable } = useDroppable({
  accepts: ({ kind, data }) => kind === "SQUARE" && data.color === "red",
});
```

- `kind` is the kind of the draggable item.
- `data` is the data associated with the draggable item.

#### `data`

Data associated with the droppable area.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  data: { maxCapacity: 5 },
});
```

The data can be accessed from the `hovered` object when a draggable item is hovered over the droppable area, or from `dropTargets` in the `onDragIn`, `onDragOut`, `onDragMove`, and `onDrop` callbacks.

#### `disabled`

Disables the drop functionality when set to true.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  disabled: true,
});
```

#### `onDragIn`

Called when a draggable item of an accepted kind enters the droppable area.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragIn: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`Draggable ${kind} entered with data`, data);
  },
});
```

The arguments are:

- `kind` is the kind of draggable item.
- `data` is the data associated with the draggable item.
- `event` is the `PointerEvent` from the `pointermove` handler.
- `element` is the element being dragged.
- `dropElement` is the droppable element itself.
- `dropTargets` is an array of current drop targets. It can be used if there are multiple drop targets at the same point.

#### `onDragOut`

Called when a draggable item leaves the droppable area.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragOut: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`Draggable ${kind} left with data`, data);
  },
});
```

Arguments are the same as in `onDragIn`.

#### `onDragMove`

Called when a draggable item moves within the droppable area. It’s called on every mouse move during the drag interaction, so avoid putting expensive logic here.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragMove: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`Draggable ${kind} moved with data`, data);
  },
});
```

Arguments are the same as in `onDragIn`.

#### `onDrop`

Called when a draggable item is dropped within the droppable area.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDrop: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`Draggable ${kind} dropped with data`, data);
  },
});
```

Arguments are the same as in `onDragIn`.

<hr />

### Full Example

Here’s a complete example demonstrating the use of all the configuration options:

```tsx
import { useDroppable } from "snapdrag";

const DroppableSquare = () => {
  const { droppable, hovered } = useDroppable({
    accepts: "SQUARE",
    data: { maxCapacity: 5 },
    disabled: false,
    onDragIn: ({ kind, data, event, element, dropElement, dropTargets }) => {
      console.log(`Draggable ${kind} entered with data`, data);
    },
    onDragOut: ({ kind, data, event, element, dropElement, dropTargets }) => {
      console.log(`Draggable ${kind} left with data`, data);
    },
    onDragMove: ({ kind, data, event, element, dropElement, dropTargets }) => {
      console.log(`Draggable ${kind} moved with data`, data);
    },
    onDrop: ({ kind, data, event, element, dropElement, dropTargets }) => {
      console.log(`Draggable ${kind} dropped with data`, data);
    },
  });

  const backgroundColor = hovered ? hovered.data.color : "red";

  return droppable(<div className="square" style={{ backgroundColor }}></div>);
};
```

## Author

Eugene Daragan

## License

MIT
