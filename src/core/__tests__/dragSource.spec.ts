import { dragSourceType, DragSource, DragSourceType } from "../dragSource";

describe("DragSource", () => {
  let dragSource: DragSource<DragSourceType<any>>;

  beforeEach(() => {
    // Create a new instance of DragSource before each test
    dragSource = new DragSource({
      // Provide the necessary configuration for the DragSource
      type: dragSourceType<null>("example"),
      data: null,
      onDragStart: jest.fn(),
      onDragMove: jest.fn(),
      onDragEnd: jest.fn(),
    });
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  it("should call onDragStart when drag starts", () => {
    // Simulate a mouse down event on the drag element
    const dragElement = document.createElement("div");
    dragSource.listen(dragElement);

    const mouseDownEvent = new MouseEvent("mousedown");
    dragElement.dispatchEvent(mouseDownEvent);

    // Expect onDragStart to have been called with the correct arguments
    expect(dragSource.config.onDragStart).toHaveBeenCalledWith({
      dragElement,
      dragStartEvent: mouseDownEvent,
      data: null, // Replace with the expected data
    });
  });

  it("should call onDragMove when drag moves", () => {
    // Simulate a mouse move event on the drag element
    const dragElement = document.createElement("div");
    dragSource.listen(dragElement);

    const mouseMoveEvent = new MouseEvent("mousemove");
    dragElement.dispatchEvent(mouseMoveEvent);

    // Expect onDragMove to have been called with the correct arguments
    expect(dragSource.config.onDragMove).toHaveBeenCalledWith({
      event: mouseMoveEvent,
      dragElement,
      dragStartEvent: null, // Replace with the expected drag start event
      dropTargets: new Map(), // Replace with the expected drop targets
      data: null, // Replace with the expected data
    });
  });

  it("should call onDragEnd when drag ends", () => {
    // Simulate a mouse up event on the drag element
    const dragElement = document.createElement("div");
    dragSource.listen(dragElement);

    const mouseUpEvent = new MouseEvent("mouseup");
    dragElement.dispatchEvent(mouseUpEvent);

    // Expect onDragEnd to have been called with the correct arguments
    expect(dragSource.config.onDragEnd).toHaveBeenCalledWith({
      event: mouseUpEvent,
      dragElement,
      dragStartEvent: null, // Replace with the expected drag start event
      dropTargets: new Map(), // Replace with the expected drop targets
      data: null, // Replace with the expected data
    });
  });
});
