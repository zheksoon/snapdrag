<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/snapdrag-black.webp" alt="Snapdrag" />
</p>

<p align="center">
  <b>⚡️ Simple yet powerful drag-and-drop for React and Vanilla JS ⚡️</b>
</p>

<p align="center">
  <img width="400" alt="Snapdrag in action" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/drag-and-drop-kanban.avif" />
</p>

## What is Snapdrag?

**Snapdrag** is a lightweight, intuitive drag-and-drop library for React that prioritizes developer experience and performance. Designed with ergonomics and simplicity at its core, Snapdrag offers a refreshing alternative to complex drag-and-drop solutions while maintaining the flexibility needed for sophisticated applications.

Snapdrag is built on top of `snapdrag/core`, a universal building block that works with any framework or vanilla JavaScript.

## Key Features

- 🚀 **Minimal, modern API:** just two hooks and one overlay component.
- 🎛️ **Full control:** granular event callbacks for every drag stage.
- 🔄 **Two-way data flow:** draggables and droppables exchange data seamlessly.
- 🗂️ **Multiple drop targets:** supports overlapping and nested zones.
- 🛑 **No HTML5 DnD:** consistent, reliable behavior across browsers.
- ⚡️ **Built for performance and extensibility.**

## Table of Contents

- [Installation](#installation)
- [Basic Concepts](#basic-concepts)
- [Quick Start Example](#quick-start-example)
- [How Snapdrag Works](#how-snapdrag-works)
- [Core Components](#core-components)
  - [useDraggable](#usedraggable)
  - [useDroppable](#usedroppable)
  - [Overlay](#overlay)
- [Draggable Lifecycle](#draggable-lifecycle)
  - [onDragStart](#ondragstart)
  - [onDragMove](#ondragmove)
  - [onDragEnd](#ondragend)
- [Droppable Lifecycle](#droppable-lifecycle)
  - [onDragIn](#ondragin)
  - [onDragMove (Droppable)](#ondragmove-droppable)
  - [onDragOut](#ondragout)
  - [onDrop](#ondrop)
- [Common Patterns](#common-patterns)
- [Examples](#examples)
  - [Basic: Colored Squares](#basic-colored-squares)
  - [Intermediate: Simple List](#intermediate-simple-list)
  - [Advanced: List with Animations](#advanced-list-with-animations)
  - [Expert: Kanban Board](#expert-kanban-board)
- [API Reference](#api-reference)
  - [useDraggable Configuration](#usedraggable-configuration)
  - [useDroppable Configuration](#usedroppable-configuration)
- [Plugins](#plugins)
- [Browser Compatibility](#browser-compatibility)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [License](#license)
- [Author](#author)

## Installation

```bash
# npm
npm install --save snapdrag

# yarn
yarn add snapdrag
```

## Basic Concepts

Snapdrag is built around three core components:

- **`useDraggable`** - A hook that makes any React element draggable
- **`useDroppable`** - A hook that makes any React element a potential drop target
- **`Overlay`** - A component that renders the dragged element during drag operations

The fundamental relationship works like this:

1. Each draggable has a **`kind`** (like "CARD" or "ITEM") that identifies what type of element it is
2. Each droppable specifies what **`kind`** it **`accepts`** through its configuration
3. They exchange **`data`** during interactions, allowing for rich behaviors and communication

When a draggable is over a compatible droppable, they can exchange information. This unlocks dynamic behaviors such as highlighting, sorting, or visually transforming elements based on the ongoing interaction.

## Quick Start Example

Here is the simplest example involving two squares. The draggable square carries a color in its data. The droppable square reacts to the drag interaction by setting its color according to the draggable’s color. When dropped, the text of the droppable square is updated.

<p align="center">
  <img width="400" alt="Simple drag-and-drop squares" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/simple-squares.avif" />
</p>

**DraggableSquare.tsx**

```tsx
import { useState } from "react";
import { useDraggable } from "snapdrag";

export const DraggableSquare = ({ color }: { color: string }) => {
  const [text, setText] = useState("Drag me");
  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color },
    move: true,
    // Callbacks are totally optional
    onDragStart({ data }) {
      // data is the own data of the draggable
      setText(`Dragging ${data.color}`);
    },
    onDragMove({ dropTargets }) {
      // Check if there are any drop targets under the pointer
      if (dropTargets.length > 0) {
        // Update the text based on the first drop target color
        setText(`Over ${dropTargets[0].data.color}`);
      } else {
        setText("Dragging...");
      }
    },
    onDragEnd({ dropTargets }) {
      // Check if the draggable was dropped on a valid target
      if (dropTargets.length > 0) {
        setText(`Dropped on ${dropTargets[0].data.color}`);
      } else {
        setText("Drag me");
      }
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  return draggable(
    <div className="square draggable" style={{ backgroundColor: color, opacity }}>
      {text}
    </div>
  );
};
```

**DroppableSquare.tsx**

```tsx
import { useState } from "react";
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }: { color: string }) => {
  const [text, setText] = useState("Drop here");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    data: { color },
    // Optional callbacks
    onDragIn({ data }) {
      // Some draggable is hovering over this droppable
      // data is the data of the draggable
      setText(`Hovered over ${data.color}`);
    },
    onDragOut() {
      // The draggable is no longer hovering over this droppable
      setText("Drop here");
    },
    onDrop({ data }) {
      // Finally, the draggable is dropped on this droppable
      setText(`Dropped ${data.color}`);
    },
  });

  return droppable(
    <div className="square droppable" style={{ backgroundColor: color }}>
      {text}
    </div>
  );
};
```

**App.tsx**

```tsx
import { Overlay } from "snapdrag";

export default function App() {
  return (
    <>
      {/* Render squares with absolute wrappers for positioning */}
      <div style={{ position: "relative" }}>
        {/* Just two squares for simplicity */}
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

This example on [CodeSandbox](https://codesandbox.io/p/sandbox/snapdrag-simple-squares-8rw96s)

This example showcases the key strengths of Snapdrag:

1. **Callbacks**: You'll see how its callback system lets you react to every stage of the drag.
2. **Easy Data Exchange**: It shows how data can flow smoothly between draggable and droppable elements.
3. **Seamless React Integration**: Notice how it updates React state based on drag events, fitting naturally into your components.
4. **Fine-Grained Control**: It demonstrates the level of control you get with direct access to drag events.

We've intentionally focused this example on the raw mechanics rather than a fancy UI pattern. This helps illustrate how Snapdrag operates at its core, giving you a clear view of its fundamental workings.

## How Snapdrag Works

Under the hood, Snapdrag takes a different approach than traditional drag-and-drop libraries:

1. **Event Listening**: Snapdrag attaches a `pointerdown` event listener to draggable elements
2. **Tracking Movement**: Once triggered, it tracks `pointermove` events on the document until `pointerup` occurs
3. **Finding Targets**: On every move, it uses `document.elementsFromPoint()` to check what elements are under the cursor
4. **Target Handling**: It then determines which droppable elements are valid targets and manages the interaction
5. **Event Firing**: Appropriate callbacks are fired based on the current state of the drag operation

Unlike HTML5 drag-and-drop which has limited customization options, Snapdrag gives you control over every aspect of the drag experience.

One key advantage: draggables aren't bound to their initial configuration. This means you can change settings at any time during the drag operation, making Snapdrag extremely flexible. Want to dynamically change what a draggable can do based on its current position? No problem!

An important note for React users: the draggable/droppable wrappers transparently handle refs to the original React element, making composition easy and natural. You can still use your own refs and event handlers without conflicts.

## Core Components

### `useDraggable`

The `useDraggable` hook makes any React element draggable. It returns an object with two properties:

- `draggable`: A function that wraps your component, making it draggable
- `isDragging`: A boolean indicating if the element is currently being dragged

Basic usage:

```tsx
const DraggableItem = () => {
  const { draggable, isDragging } = useDraggable({
    kind: "ITEM", // Required: identifies this draggable type
    data: { id: "123" }, // Optional: data to share during drag operations
    move: true, // Optional: move vs clone during dragging
  });

  return draggable(<div className={isDragging ? "dragging" : ""}>Drag me!</div>);
};
```

**Important Note**: The wrapped component must accept a `ref` to the DOM node to be draggable. If you already have a ref, Snapdrag will handle it correctly:

```jsx
const myRef = useRef(null);

const { draggable } = useDraggable({
  kind: "ITEM",
});

// Both refs work correctly
return draggable(<div ref={myRef} />);
```

You can even make an element both draggable and droppable:

```jsx
const { draggable } = useDraggable({ kind: "ITEM" });
const { droppable } = useDroppable({ accepts: "ITEM" });

// Combine the wrappers (order doesn't matter)
return draggable(droppable(<div>I'm both!</div>));
```

### `useDroppable`

The `useDroppable` hook makes any React element a potential drop target. It returns:

- `droppable`: A function that wraps your component, making it a drop target
- `hovered`: Data about the draggable currently hovering over this element (or `null` if none)

Basic usage:

```jsx
const DropZone = () => {
  const { droppable, hovered } = useDroppable({
    accepts: "ITEM", // Required: which draggable kinds to accept
    data: { zone: "main" }, // Optional: data to share with draggables
    onDrop({ data }) {
      // Optional: handle successful drops
      console.log("Dropped item:", data.id);
    },
  });

  // Change appearance when being hovered
  const isHovered = Boolean(hovered);

  return droppable(<div className={isHovered ? "drop-zone hovered" : "drop-zone"}>Drop here</div>);
};
```

### `Overlay`

The `Overlay` component renders the currently dragged element. It should be included once in your application:

```tsx
import { Overlay } from "snapdrag";

function App() {
  return (
    <div>
      {/* Your app content */}
      <YourDraggableComponents />

      {/* Required: Shows the dragged element */}
      <Overlay />
    </div>
  );
}
```

#### Overlay Component Customization

You can customize the appearance of the `Overlay` component using the `style` and `className` props.

**`style`**: An object that allows you to apply inline styles to the overlay wrapper. This is useful for setting properties like `zIndex` or a custom background.

```jsx
<Overlay style={{ zIndex: 9999, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
```

**`className`**: A string that allows you to apply CSS classes to the overlay wrapper. This is useful for applying predefined styles from your CSS stylesheets.

```jsx
<Overlay className="custom-overlay" />
```

These props provide flexibility in integrating the `Overlay` component seamlessly into your application's design.

## Draggable Lifecycle

The draggable component goes through a lifecycle during drag interactions, with callbacks at each stage.

### `onDragStart`

Called when the drag operation begins (after the user clicks and begins moving, and after `shouldDrag` if provided, returns `true`):

```jsx
const { draggable } = useDraggable({
  kind: "CARD",
  onDragStart({ data, event, dragStartEvent, element }) {
    console.log("Started dragging card:", data.id);
    // Setup any state needed during dragging
  },
});
```

The callback receives an object with the following properties:

- `data`: The draggable's data (from the `data` config option of `useDraggable`).
- `event`: The `PointerEvent` that triggered the drag start (usually the first `pointermove` after `pointerdown` and `shouldDrag` validation).
- `dragStartEvent`: The initial `PointerEvent` from `pointerdown` that initiated the drag attempt.
- `element`: The DOM element that is being dragged (this is the element rendered in the `Overlay`).

### `onDragMove`

Called on every pointer movement during dragging:

```jsx
const { draggable } = useDraggable({
  kind: "CARD",
  onDragMove({ dropTargets, top, left, data, event, dragStartEvent, element }) {
    // dropTargets contains info about all drop targets under the pointer
    if (dropTargets.length > 0) {
      console.log("Over drop zone:", dropTargets[0].data.zone);
    }

    // top and left are the screen coordinates of the draggable
    console.log(`Position: ${left}px, ${top}px`);
  },
});
```

In addition to the properties from `onDragStart` (`data`, `dragStartEvent`, `element`), this callback receives:

- `event`: The current `PointerEvent` from the `pointermove` handler.
- `dropTargets`: An array of objects, each representing a droppable target currently under the pointer. Each object contains:
  - `data`: The `data` associated with the droppable (from its `useDroppable` configuration).
  - `element`: The DOM element of the droppable.
- `top`: The calculated top screen coordinate of the draggable element in the overlay.
- `left`: The calculated left screen coordinate of the draggable element in the overlay.

**Note**: This callback is called frequently, so avoid expensive operations here.

### `onDragEnd`

Called when the drag operation completes (on `pointerup`):

```jsx
const { draggable } = useDraggable({
  kind: "CARD",
  onDragEnd({ dropTargets, top, left, data, event, dragStartEvent, element }) {
    if (dropTargets.length > 0) {
      console.log("Dropped on:", dropTargets[0].data.zone);
    } else {
      console.log("Dropped outside of any drop zone");
      // Handle "cancel" logic
    }
  },
});
```

Receives the same properties as `onDragMove` (`data`, `event`, `dragStartEvent`, `element`, `dropTargets`, `top`, `left`).
If the user dropped the element on valid drop targets, `dropTargets` will contain them; otherwise, it will be an empty array.
The `top` and `left` coordinates represent the final position of the draggable in the overlay just before it's hidden.

## Droppable Lifecycle

The droppable component also has lifecycle events during drag interactions. All droppable callbacks receive a `dropTargets` array, similar to the one in `useDraggable`'s `onDragMove` and `onDragEnd`, representing all droppables currently under the pointer.

### `onDragIn`

Called when a draggable first enters this drop target:

```jsx
const { droppable } = useDroppable({
  accepts: "CARD",
  onDragIn({ kind, data, event, element, dropElement, dropTargets }) {
    console.log(`${kind} entered drop zone`);
    // Change appearance, update state, etc.
  },
});
```

The callback receives an object with:

- `kind`: The `kind` of the draggable that entered.
- `data`: The `data` from the draggable.
- `event`: The current `PointerEvent` from the `pointermove` handler.
- `element`: The DOM element of the draggable.
- `dropElement`: The DOM element of this droppable.
- `dropTargets`: Array of all active drop targets under the pointer, including the current one. Each entry contains:
  - `data`: The `data` from the droppable (from its `useDroppable` configuration).
  - `element`: The DOM element of the droppable.

This is called once when a draggable enters and can be used to trigger animations or state changes.

### `onDragMove` (Droppable)

Called as a draggable moves _within_ the drop target:

```jsx
const { droppable } = useDroppable({
  accepts: "CARD",
  onDragMove({ kind, data, event, element, dropElement, dropTargets }) {
    // Calculate position within the drop zone
    const rect = dropElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(`Position in drop zone: ${x}px, ${y}px`);
  },
});
```

Receives the same properties as `onDragIn`. Like the draggable version, this is called frequently, so keep operations light. This is perfect for creating dynamic visual cues like highlighting different sections of your drop zone based on cursor position.

### `onDragOut`

Called when a draggable leaves the drop target:

```jsx
const { droppable } = useDroppable({
  accepts: "CARD",
  onDragOut({ kind, data, event, element, dropElement, dropTargets }) {
    console.log(`${kind} left drop zone`);
    // Revert animations, update state, etc.
  },
});
```

Receives the same properties as `onDragIn`. This is typically used to undo changes made in `onDragIn`. Use it to clean up and reset any visual changes you made when the draggable entered.

### `onDrop`

Called when a draggable is successfully dropped on this target:

```jsx
const { droppable } = useDroppable({
  accepts: "CARD",
  onDrop({ kind, data, event, element, dropElement, dropTargets }) {
    console.log(`${kind} was dropped with data:`, data);
    // Handle the dropped item
  },
});
```

Receives the same properties as `onDragIn`. This is where you implement the main logic for what happens when a drop succeeds. Update your application state, save the new position, or trigger any other business logic related to the completed drag operation.

## Common Patterns

### Two-way Data Exchange

Snapdrag makes it simple for draggables and droppables to talk to each other by exchanging data in both directions:

```jsx
// Draggable component accessing droppable data
const { draggable } = useDraggable({
  kind: "CARD",
  data: { id: "card-1", color: "red" },
  onDragMove({ dropTargets }) {
    if (dropTargets.length > 0) {
      // Read data from the drop zone underneath
      const dropZoneType = dropTargets[0].data.type;
      console.log(`Over ${dropZoneType} zone`);
    }
  },
});

// Droppable component accessing draggable data
const { droppable, hovered } = useDroppable({
  accepts: "CARD",
  data: { type: "inbox" },
  onDragIn({ data }) {
    console.log(`Card ${data.id} entered inbox`);
  },
});
```

This pattern is especially useful for adapting the UI based on the interaction context.

### Dynamic Colors Example

Here's how to create a draggable that changes color based on the droppable it's over:

```jsx
// In DraggableSquare.tsx
import { useState } from "react";
import { useDraggable } from "snapdrag";

export const DraggableSquare = ({ color: initialColor }) => {
  const [color, setColor] = useState(initialColor);

  const { draggable, isDragging } = useDraggable({
    kind: "SQUARE",
    data: { color },
    move: true,
    onDragMove({ dropTargets }) {
      if (dropTargets.length) {
        setColor(dropTargets[0].data.color);
      } else {
        setColor(initialColor);
      }
    },
    onDragEnd() {
      setColor(initialColor); // Reset on drop
    },
  });

  return draggable(
    <div
      className="square"
      style={{
        backgroundColor: color,
        opacity: isDragging ? 0.9 : 1,
      }}
    >
      {isDragging ? "Dragging" : "Drag me"}
    </div>
  );
};

// In DroppableSquare.tsx
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }) => {
  const [text, setText] = useState("Drop here");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    data: { color }, // Share this color with draggables
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

### Dynamic Border Example

This example shows how to create a visual indication of where an item will be dropped:

```jsx
import { useState } from "react";
import { useDroppable } from "snapdrag";

export const DroppableSquare = ({ color }) => {
  const [text, setText] = useState("Drop here");
  const [borderPosition, setBorderPosition] = useState("");

  const { droppable } = useDroppable({
    accepts: "SQUARE",
    onDragMove({ event, dropElement }) {
      // Calculate which quadrant of the square the pointer is in
      const { top, left, height } = dropElement.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;

      // Set border on the appropriate side
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
      setBorderPosition(""); // Remove border when draggable leaves
    },
    onDrop({ data }) {
      setText(`Dropped ${data.color}`);
      setBorderPosition(""); // Remove border after drop
    },
  });

  // Add border to appropriate side
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

### Multiple Drop Targets

Snapdrag handles the case where multiple drop targets overlap:

```jsx
const { draggable } = useDraggable({
  kind: "ITEM",
  onDragMove({ dropTargets }) {
    // Check all droppables under this point
    dropTargets.forEach((target) => {
      console.log(`Over ${target.data.name} (z-index: ${target.data.zIndex})`);
    });

    // Sort by z-index to find the topmost
    const sorted = [...dropTargets].sort((a, b) => b.data.zIndex - a.data.zIndex);

    if (sorted.length) {
      console.log(`Topmost target: ${sorted[0].data.name}`);
    }
  },
});
```

### Drag Threshold

For finer control, you can start dragging only after the pointer has moved a certain distance:

```jsx
const { draggable } = useDraggable({
  kind: "ITEM",
  shouldDrag({ event, dragStartEvent }) {
    // Calculate distance from start position
    const dx = event.clientX - dragStartEvent.clientX;
    const dy = event.clientY - dragStartEvent.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only start dragging after moving 5px
    return distance > 5;
  },
});
```

### Touch Support

Snapdrag supports touch events out of the box. It uses `PointerEvent` to handle both mouse and touch interactions seamlessly. You can use the same API for both types of events.

To make your draggable elements touch-friendly, ensure they are touchable (e.g., using `touch-action: none` in CSS). The container can have `touch-action: pan-x` or `touch-action: pan-y` to allow scrolling while dragging.

## Examples

Snapdrag includes several examples that demonstrate its capabilities, from simple to complex use cases.

### Basic: Colored Squares

The simplest example shows dragging a colored square onto a drop target:

<p align="center">
  <img width="400" alt="Simple squares" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/drag-and-drop-squares.avif" />
</p>

This demonstrates the fundamentals of drag-and-drop with Snapdrag:

- Defining a draggable with `kind` and `data`
- Creating a drop target that `accepts` the draggable
- Handling the `onDrop` event

[Try it on CodeSandbox](https://codesandbox.io/p/sandbox/snapdrag-simple-squares-8rw96s)

### Intermediate: Simple List

A sortable list where items can be reordered by dragging:

<p align="center">
  <img width="400" alt="Simple List" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/drag-and-drop-simple-list.avif" />
</p>

This example demonstrates:

- Using data to identify list items
- Visual feedback during dragging (blue insertion line)
- Reordering items in a state array on drop

[Try it on CodeSandbox](https://codesandbox.io/p/sandbox/snapdrag-simple-list-w4njk5)

### Advanced: List with Animations

A more sophisticated list with smooth animations:

<p align="center">
  <img width="400" alt="Advanced list" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/drag-and-drop-advanced-list.avif" />
</p>

This example showcases:

- CSS transitions for smooth animations
- A special drop area for appending items to the end
- Animated placeholders that create space for dropped items

[Try it on CodeSandbox](https://codesandbox.io/p/sandbox/snapdrag-advanced-list-5p44wd)

### Expert: Kanban Board

A full kanban board with multiple columns and draggable cards:

<p align="center">
  <img width="400" alt="Kanban Board" src="https://raw.githubusercontent.com/zheksoon/snapdrag/readme-rewrite/assets/drag-and-drop-kanban.avif" />
</p>

This complex example demonstrates advanced features:

- Multiple drop targets with different behaviors
- Conditional acceptance of draggables
- Smooth animations during drag operations
- Two-way data exchange between components
- Touch support with drag threshold
- Item addition and removal

All this is achieved in just about 200 lines of code (excluding state management and styling).

[Try it on CodeSandbox](https://codesandbox.io/p/sandbox/snapdrag-kanban-board-jlj4wc)

## API Reference

### `useDraggable` Configuration

The `useDraggable` hook accepts a configuration object with these options:

| Option        | Type                   | Description                                                                           |
| ------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `kind`        | `string` or `symbol`   | **Required.** Identifies this draggable type                                          |
| `data`        | `object` or `function` | Data to share with droppables. Can be a static object or a function that returns data |
| `disabled`    | `boolean`              | When `true`, disables dragging functionality                                          |
| `move`        | `boolean`              | When `true`, moves the component instead of cloning it to the overlay                 |
| `component`   | `function`             | Provides a custom component to show while dragging                                    |
| `placeholder` | `function`             | Custom component to show in place of the dragged item                                 |
| `offset`      | `object` or `function` | Controls positioning relative to cursor                                               |

**Event Callbacks:**

| Callback      | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `shouldDrag`  | Function determining if dragging should start. Must return `true` or `false` |
| `onDragStart` | Called when drag begins                                                      |
| `onDragMove`  | Called on every pointer move while dragging                                  |
| `onDragEnd`   | Called when dragging ends                                                    |

#### Detailed Configuration Description

##### `kind` (Required)

Defines the type of the draggable. It must be a unique string or symbol.

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE", // Identify this as a "SQUARE" type
});
```

##### `data`

Data associated with the draggable. It can be a static object or a function that returns an object:

```jsx
// Static object
const { draggable } = useDraggable({
  kind: "SQUARE",
  data: { color: "red", id: "square-1" },
});

// Function (calculated at drag start)
const { draggable } = useDraggable({
  kind: "SQUARE",
  data: ({ dragElement, dragStartEvent }) => ({
    id: dragElement.id,
    position: { x: dragStartEvent.clientX, y: dragStartEvent.clientY },
  }),
});
```

##### `disabled`

When `true`, temporarily disables dragging:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  disabled: !canDrag, // Disable based on some condition
});
```

##### `move`

When `true`, the original component is moved during dragging instead of creating a clone:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  move: true, // Move the actual component
});
```

Note: If `move` is `false` (default), the component is cloned to the overlay layer while the original stays in place. The original component won't receive prop updates during dragging.

##### `component`

A function that returns a custom component to be shown during dragging:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  component: ({ data, props }) => <Square color={data.color} style={{ opacity: 0.8 }} />,
});
```

##### `placeholder`

A function that returns a component to be shown in place of the dragged item:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  placeholder: ({ data, props }) => <Square color="gray" style={{ opacity: 0.4 }} />,
});
```

When specified, the `move` option is ignored.

##### `offset`

Controls the offset of the dragging component relative to the cursor:

```jsx
// Static offset
const { draggable } = useDraggable({
  kind: "SQUARE",
  offset: { top: 10, left: 10 }, // 10px down and right from cursor
});

// Dynamic offset
const { draggable } = useDraggable({
  kind: "SQUARE",
  offset: ({ element, event, data }) => {
    // Calculate based on event or element position
    return { top: 0, left: 0 };
  },
});
```

If not specified, the offset is calculated to maintain the element's initial position relative to the cursor.

#### Callback Details

##### `shouldDrag`

Function that determines if dragging should start. It's called on every pointer move until it returns `true` or the drag attempt ends:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  shouldDrag: ({ event, dragStartEvent, element, data }) => {
    // Only drag if shifted 10px horizontally
    return Math.abs(event.clientX - dragStartEvent.clientX) > 10;
  },
});
```

##### `onDragStart`

Called when dragging begins (after `shouldDrag` returns `true`):

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragStart: ({ event, dragStartEvent, element, data }) => {
    console.log("Drag started at:", event.clientX, event.clientY);
    // Setup any initial state needed during drag
  },
});
```

##### `onDragMove`

Called on every pointer move during dragging:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragMove: ({ event, dragStartEvent, element, data, dropTargets, top, left }) => {
    // Current drop targets under the pointer
    if (dropTargets.length) {
      console.log("Over drop zone:", dropTargets[0].data.name);
    }

    // Current position of the draggable
    console.log("Position:", top, left);
  },
});
```

The `dropTargets` array contains information about all current drop targets under the cursor. Each entry has `data` (from the droppable's configuration) and `element` (the DOM element).

##### `onDragEnd`

Called when dragging ends:

```jsx
const { draggable } = useDraggable({
  kind: "SQUARE",
  onDragEnd: ({ event, dragStartEvent, element, data, dropTargets }) => {
    if (dropTargets.length) {
      console.log("Dropped on:", dropTargets[0].data.name);
    } else {
      console.log("Dropped outside any drop target");
      // Handle "cancel" case
    }
  },
});
```

### `useDroppable` Configuration

The `useDroppable` hook accepts a configuration object with these options:

| Option     | Type                                       | Description                                  |
| ---------- | ------------------------------------------ | -------------------------------------------- |
| `accepts`  | `string`, `symbol`, `array`, or `function` | **Required.** What draggable kinds to accept |
| `data`     | `object`                                   | Data to share with draggables                |
| `disabled` | `boolean`                                  | When `true`, disables dropping               |

**Event Callbacks:**

| Callback     | Description                                          |
| ------------ | ---------------------------------------------------- |
| `onDragIn`   | Called when a draggable enters this droppable        |
| `onDragOut`  | Called when a draggable leaves this droppable        |
| `onDragMove` | Called when a draggable moves within this droppable  |
| `onDrop`     | Called when a draggable is dropped on this droppable |

#### Detailed Configuration Description

##### `accepts` (Required)

Defines what kinds of draggables this drop target can accept:

```jsx
// Accept a single kind
const { droppable } = useDroppable({
  accepts: "SQUARE",
});

// Accept multiple kinds
const { droppable } = useDroppable({
  accepts: ["SQUARE", "CIRCLE"],
});

// Use a function for more complex logic
const { droppable } = useDroppable({
  accepts: ({ kind, data }) => {
    // Check both kind and data to determine acceptance
    return kind === "SQUARE" && data.color === "red";
  },
});
```

##### `data`

Data associated with the droppable area:

```jsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  data: {
    zoneId: "dropzone-1",
    capacity: 5,
    color: "blue",
  },
});
```

This data is accessible to draggables through the `dropTargets` array in their callbacks.

##### `disabled`

When `true`, temporarily disables dropping:

```jsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  disabled: isFull, // Disable based on some condition
});
```

#### Callback Details

##### `onDragIn`

Called when a draggable of an accepted kind first enters this drop target:

```jsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragIn: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`${kind} entered with data:`, data);
    // Change appearance, play sound, etc.
  },
});
```

Arguments:

- `kind` - The kind of the draggable
- `data` - The data from the draggable
- `event` - The current pointer event
- `element` - The draggable element
- `dropElement` - The droppable element
- `dropTargets` - Array of all current drop targets under the pointer

##### `onDragOut`

Called when a draggable leaves this drop target:

```jsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragOut: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`${kind} left the drop zone`);
    // Revert appearance changes, etc.
  },
});
```

Arguments are the same as `onDragIn`.

##### `onDragMove`

Called when a draggable moves within this drop target:

```jsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDragMove: ({ kind, data, event, element, dropElement, dropTargets }) => {
    // Calculate position within drop zone
    const rect = dropElement.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    console.log(`Position in zone: ${relativeX}px, ${relativeY}px`);
  },
});
```

Arguments are the same as `onDragIn`.

##### `onDrop`

Called when a draggable is dropped on this target:

```jsx
const { droppable } = useDroppable({
  accepts: "SQUARE",
  onDrop: ({ kind, data, event, element, dropElement, dropTargets }) => {
    console.log(`${kind} was dropped with data:`, data);
    // Handle the dropped item (update state, etc.)
  },
});
```

Arguments are the same as the other callbacks.

## Plugins

Snapdrag offers a plugin system to extend its core functionality. Plugins can hook into the draggable lifecycle events (`onDragStart`, `onDragMove`, `onDragEnd`) to add custom behaviors.

### Scroller Plugin

The `scroller` plugin automatically scrolls a container element when a dragged item approaches its edges. This is useful for large scrollable areas where users might need to drag items beyond the visible viewport.

**Initialization**

To use the scroller plugin, first create an instance of it by calling `createScroller(config)`.

```typescript
import { createScroller } from "snapdrag/plugins";

const scroller = createScroller({
  x: true, // Enable horizontal scrolling with default settings
  y: { threshold: 150, speed: 1000, distancePower: 2 }, // Enable vertical scrolling with custom settings
});
```

**Configuration Options (`ScrollerConfig`)**

- `x`: (Optional) Enables or configures horizontal scrolling.
  - `boolean`: If `true`, uses default settings. If `false` or omitted, horizontal scrolling is disabled.
  - `object (AxisConfig)`: Allows fine-tuning of horizontal scrolling behavior:
    - `threshold` (number, default: `100`): The distance in pixels from the container's edge at which scrolling should begin.
    - `speed` (number, default: `2000`): The maximum scroll speed in pixels per second when the pointer is at the very edge of the container.
    - `distancePower` (number, default: `1.5`): Controls the acceleration of scrolling as the pointer gets closer to the edge. A higher value means faster acceleration.
- `y`: (Optional) Enables or configures vertical scrolling. Accepts the same `boolean` or `object (AxisConfig)` values as `x`.

**Usage with `useDraggable`**

Once created, the scroller instance needs to be passed to the `plugins` array in the `useDraggable` hook's configuration. The scroller function itself takes the scrollable container element as an argument.

```jsx
import { useDraggable } from "snapdrag";
import { createScroller } from "snapdrag/plugins";
import { useRef, useEffect, useState } from "react";

// Initialize the scroller plugin
const scrollerPlugin = createScroller({ x: true, y: true });

const DraggableComponent = () => {
  const scrollContainerRef = useRef(null);
  // State to hold the container element once it's mounted
  const [scrollContainer, setScrollContainer] = useState(null);

  useEffect(() => {
    // Set the container element once the ref is populated
    if (scrollContainerRef.current) {
      setScrollContainer(scrollContainerRef.current);
    }
  }, []);

  const { draggable } = useDraggable({
    kind: "ITEM",
    data: { id: "my-item" },
    // Pass the scroller plugin, providing the scrollable container
    plugins: scrollContainer ? [scrollerPlugin(scrollContainer)] : [],
  });

  return (
    <div
      ref={scrollContainerRef}
      style={{ overflow: "auto", height: "200px", width: "300px", border: "1px solid black" }}
    >
      <div style={{ height: "500px", width: "800px" }}>
        {" "}
        {/* Inner content larger than container */}
        {draggable(
          <div style={{ width: "100px", height: "50px", backgroundColor: "lightblue" }}>
            Drag me
          </div>
        )}
        {/* More draggable items or content here */}
      </div>
    </div>
  );
};
```

**How it Works**

1.  **Initialization**: `createScroller` returns a new scroller function configured with your desired settings.
2.  **Plugin Attachment**: When you pass `scrollerPlugin(containerElement)` to `useDraggable`, Snapdrag calls the appropriate lifecycle methods of the plugin (`onDragStart`, `onDragMove`, `onDragEnd`).
3.  **Drag Monitoring**: During a drag operation, `onDragMove` is continuously called. The scroller plugin checks the pointer's position relative to the specified `containerElement`.
4.  **Edge Detection**: If the pointer moves within the `threshold` distance of an edge for an enabled axis (x or y), the plugin initiates scrolling.
5.  **Scrolling Speed**: The scrolling speed increases polynomially (based on `distancePower`) as the pointer gets closer to the edge, up to the maximum `speed`.
6.  **Animation Loop**: Scrolling is performed using `requestAnimationFrame` for smooth animation.
7.  **Cleanup**: When the drag ends (`onDragEnd`) or the component unmounts, the plugin cleans up any active animation frames.

**Important Considerations:**

- The `containerElement` passed to the scroller function must be the actual scrollable DOM element.
- Ensure the `containerElement` has `overflow: auto` or `overflow: scroll` CSS properties set for the respective axes you want to enable scrolling on.
- If the scrollable container is not immediately available on component mount (e.g., if its ref is populated later), you might need to conditionally apply the plugin or update it, as shown in the example using `useState` and `useEffect` to pass the container element once it's available.
- The plugin calculates distances based on the viewport. If your scroll container or draggable items are scaled using CSS transforms, you might need to adjust threshold and speed values accordingly or ensure pointer events are correctly mapped.

The `scroller` plugin offers a straightforward way to add automatic scrolling to your drag-and-drop interfaces. It significantly enhances usability, especially when users need to drag items across large, scrollable containers or overflowing content areas.

## Browser Compatibility

Snapdrag is compatible with all modern browsers that support Pointer Events. This includes:

- Chrome 55+
- Firefox 59+
- Safari 13.1+
- Edge 18+

Mobile devices are also supported as long as they support Pointer Events.

## Comparison with Alternatives

| Feature               | Snapdrag | react-dnd  | react-beautiful-dnd |
| --------------------- | -------- | ---------- | ------------------- |
| API Style             | Hooks    | HOCs/Hooks | Components          |
| Bundle Size           | Small    | Medium     | Large               |
| Requires Context      | No       | Yes        | Yes                 |
| HTML5 DnD             | No       | Yes        | No                  |
| Multiple Drop Targets | Yes      | Limited    | No                  |
| Animation Control     | Full     | Limited    | Built-in            |
| Learning Curve        | Gentle   | Steep      | Moderate            |
| Two-way Data Exchange | Yes      | Limited    | No                  |
| Mobile Support        | Yes      | Limited    | Yes                 |

## License

MIT

## Author

Eugene Daragan
