<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/Snapdrag.webp" alt="Snapdrag" />
</p>

<h1 align="center">
  Snapdrag 
</h1>

<p align="center">
  <b>⚡️ Simple but powerful drag-and-drop for React and vanilla JS⚡️</b>
</p>

## What is it?

**Snapdrag** is a library for drag-and-drop with React in the first place. I was tired of the bulky APIs other libraries offer, so decided to experiment a bit on the ergonomics and simplicity, while maintaining flexibility and customization. It's built on top of `snapdrag/core`, the universal building block for any framework and vanilla JS.

## Key Features

- **Dead** simple - just `useDraggable`, `useDroppable` hooks, and `Overlay` component to go
- **Super** ergonomic - no need for memoizing callbacks or config
- **Full** customization - rich event system
- **Two-way** data exchange for draggable and droppable
- **Multiple** targets at the same point - do your logic for multilayer interactions
- **No HTML5** drag-and-drop used - for good and for bad

## Table of Contents

- [Installation](#installation)
- [Show me the code!](#show-me-the-code)
- [How it works](#how-it-works)
- [`useDraggable`](#usedraggable)
  - [Basic Configuration](#basic-configuration)
  - [Detailed config](#detailed-description-of-config)
  - [Config example](#full-example)
- [`useDroppable`](#usedroppable)
  - [Basic Configuration](#basic-configuration-1)
  - [Detailed config](#detailed-description-of-config-1)
  - [Full Example](#full-example-1)

## Installation

```bash
npm i --save snapdrag

yarn add snapdrag
```

## Show me the code!

Here's the simplest example of two squares. The draggable square carries color in its data, the droppable square reacts to the drag interaction and sets its color according to the color. When dropped, the text of the droppable square is updated.

<img width=400 alt="simple drag-and-drop squares" src="https://raw.githubusercontent.com/zheksoon/snapdrag/better-readme/assets/drag-and-drop-1.webp" />

The `DraggableSquare` uses `useDraggable` hook to make it draggable. The config of the hook defines the kind and the data of the draggable. The `draggable` wrapper is used to make the component draggable:

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

The `DroppableSquare` uses `useDroppable` hook to make it droppable. The config defines the accepted kind and the callback for the drop event. The `droppable` wrapper is used to make the component droppable. `hovered` is used to get the data of draggable when it's hovered:

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

This example on CodeSandbox: https://codesandbox.io/p/sandbox/snapdrag-simple-squares-8rw96s

See more examples in the `examples` folder and in the [Examples](examples) section.

## How it works

Under the hood, Snapdrag attaches `pointerdown` event listener to draggable elements, and after it's triggered, it tracks `pointermove` on the document until `pointerup` happens. On every `pointermove` event it checks elements under the cursor using `document.elementsFromPoint()`, and then does the logic of tracking current and new droppables at the point. 

Draggables aren't bound to config, so it can be changed any time (see core documentation), it makes it very flexible to use new closures, settings, etc. React bindings wraps this logic from core and adapts some arguments to be more convinient. 

One important point for React is `draggable`/`drappable` wrappers - they keep the original ref to the React element and populate is as usual, so it makes it fully transparent and easy to compose.

## `useDraggable`

`useDraggable` hook returns an object with `draggable` and `isDragging` properties. To make it work, just wrap your component with `draggable`, and then use `isDragging` to get the drag status. The only required field in the hook config is `kind` - it defines how to differentiate the draggable from others:

```ts
const DraggableSquare = () => {
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    // other fields are optional
  });

  return draggable(<div>{isDragging ? "dragging" : "drag me"}</div>);
};
```

**Important note:** the wrapped component must take a ref to the DOM node to be draggable. If you specify another ref for the component explicitly, `draggable` will handle it correctly, like this:

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
const { draggable, isDragging } = useDraggable({
  kind: "SQUARE", 
});

const { droppable, hovered } = useDroppable({
  accepts: "SQUARE",
});

const text = isDragging ? "Dragging" : hovered && "Hovered" : "Drag me";

// the order doesn't matter
return draggable(droppable(<div className="square">{text}</div>));
```


## `useDroppable`

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

When the droppable is hovered by the draggable, the `hovered` returns its data and kind. Elsewhere, it's null.

Like the `draggable` wrapper, the component can be wrapped both in `draggable` and `droppable`, the order doesn't matter.

## Examples

## `useDraggable` Configuration

The `useDraggable` hook takes a configuration object that allows you to customize its behavior. Below are the configuration options available:

### Basic Configuration

| Option         | Type       | Description                        |
|----------------|------------|------------------------------------|
| [`kind`](#kind) | `string` or `symbol` | Required| Defines the type of the draggable. Must be unique to differentiate from other draggables.            |
| [`data`](#data) | `object` or `function` | Data associated with the draggable. It can also be a function returning the data object.             |
| [`disabled`](#disabled)     | `boolean`      | Disables the drag functionality when set to true.                                                    |
| [`move`](#move)         | `boolean`      | Moves the component instead of cloning it to the overlay layer.                                      |
| [`component`](#component)    | `function`     | Function that returns a component to be shown as the draggable.                                      |
| [`placeholder`](#placeholder)  | `function`     | Function that returns a placeholder component to be shown in place of the draggable component.       |
| [`offset`](#offset)       | `{ top: number, left: number }` or `function` | Determines the offset of the dragging component relative to the cursor position.                     |

### Callbacks

| Callback         | Description                                                                                           |
|------------------|-------------------------------------------------------------------------------------------------------|
| [`shouldDrag`](#shoulddrag)     | Function to define if the element should react to drag interactions. Must return `true` or `false`.  |
| [`onDragStart`](#ondragstart)    | Called when the drag interaction starts.                                                              |
| [`onDragMove`](#ondragmove)     | Called on every mouse move during the drag interaction.                                               |
| [`onDragEnd`](#ondragend)      | Called when the drag interaction ends.                                                                |

### Detailed config description

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

`dragElement` is the `HTMLElement` being dragged, and `dragStartEvent` is the `PointerEvent` that started the drag interaction (from `pointerdown` handler).

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

Also, it's important to note that the original component will not receive props updates during the drag interaction - they all are applied to the dragging component.

`move` is ignored when the `placeholder` option is specified.

#### `component`
A function that returns a component to be shown as the draggable.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  component: ({ data, props }) => <Square color="blue" />,
});
```

if specified, it will replace the dragging component with the one returned by the function.

`data` here is the data associated with the draggable. `props` are the props of the draggable component.

The component function is called on every props update, so you can use it to update the draggable component based on it.

#### `placeholder`
A function that returns a placeholder component to be shown in place of the draggable component. When specified, the `move` option is ignored.

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

**TODO**: add example demonstrating the offset

Offset is calculated once when the drag interaction starts. It's the distance between the cursor position and the top-left corner of the dragging component. If not specified, it's computed in a way that the component position matches the rendered position before the drag.

### Callbacks

#### `shouldDrag`
Function to define if the element should react to drag interactions. Must return `true` or `false`.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  shouldDrag: ({ event, dragStartEvent, element, data }) => {
    return true;
  },
});
```

`shouldDrag` is called on every mouse move during the drag interaction until it returns `true` or the drag interaction ends. It's useful to add a threshold or some other condition to start the drag interaction.

The arguments are:
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

The callback is an important place to do some initial setup or calculations before the drag interaction starts.

The arguments of the callback are:
- `event` is the `PointerEvent` from the `pointermove` handler.
- `dragStartEvent` is the `PointerEvent` from the `pointerdown` handler.
- `element` is the element on which the drag interaction occurs.
- `data` is the data associated with the draggable.

`event` here is different from `dragStartEvent` because the `onDragStart` called only when `shouldDrag` returns `true`, so the `event` is the first `pointermove` event after that.

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

The callback is called on every mouse move during the drag interaction. It's not recommended to put expensive logic here because it's called frequently.

The  arguments are the same as in `onDragStart` with some additions:

- `dropTargets` is an array of drop targets where the draggable is currently over. The drop target is an object with the following fields:
  - `element` is the drop target element.
  - `data` is the data associated with the drop target.
- `top` and `left` are the coordinates of the rendered draggable element relative to the viewport (not mouse coordinates).

#### `onDragEnd`
Called when the drag interaction ends. `dropTargets` will be an empty array if the draggable wasn't dropped.

```tsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragEnd: ({ event, dragStartEvent, element, data, dropTargets }) => {
    console.log("Drag ended", data);
  },
});
```

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

## `useDroppable` config

### Basic Configuration

| Option         | Type       | Description                        |
|----------------|------------|------------------------------------|
| [`accepts`](#accepts) | `string`, `symbol`, `array`, or `function` | Required| Defines the kinds of draggable items this droppable area can accept.            |
| [`data`](#data-1) | `object` | Data associated with the droppable area.                                        |
| [`disabled`](#disabled-1) | `boolean` | Disables the drop functionality when set to true.                                |

#### Callbacks

| Callback         | Description                                          |
|------------------|------------------------------------------------------|
| [`onDragIn`](#ondragin)  | Called when a draggable item of an accepted kind enters the droppable area.       |
| [`onDragOut`](#ondragout) | Called when a draggable item leaves the droppable area.                           |
| [`onDragMove`](#ondragmove-1)  | Called when a draggable item moves within the droppable area.                     |
| [`onDrop`](#ondrop)  | Called when a draggable item is dropped within the droppable area.                |

### Detailed config description

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

`kind` is the kind of the draggable item, and `data` is the data associated with the draggable item.

#### `data`

Data associated with the droppable area.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  data: { maxCapacity: 5 },
});
```

The data can be accessed from the `hovered` object when a draggable item is hovered over the droppable area, or `dropTargets` in the `onDragIn`, `onDragOut`, `onDragMove`, and `onDrop` callbacks.

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
It's not called if the drop target is disabled, or the draggable item is not accepted.

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

The arguments are the same as in `onDragIn`.

#### `onDragMove`

Called when a draggable item moves within the droppable area. It's called on every mouse move during the drag interaction, so avoid putting expensive logic here.

```tsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragMove: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`Draggable ${kind} moved with data`, data);
  },
});
```

The arguments are the same as in `onDragIn`.

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

The arguments are the same as in `onDragIn`.

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

  return droppable(
    <div className="square" style={{ backgroundColor }}></div>
  );
};
```

## Author

Eugene Daragan

## License

MIT
