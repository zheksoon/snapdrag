export type PointerEventHandler = (event: PointerEvent) => void;

export type Destructor = () => void;

export type DropTargetsMap = Map<HTMLElement, IDroppable>;

export type DragStarHandlerArgs = {
  event: PointerEvent;
  dragElement: HTMLElement;
  dragStartEvent: PointerEvent;
  data?: any;
};

type DragHandlerArgs = {
  event: PointerEvent;
  dragElement: HTMLElement;
  dragStartEvent: PointerEvent;
  dropTargets: DropTargetsMap;
  data?: any;
};

export type PluginType = {
  onDragStart?: (args: DragStarHandlerArgs) => boolean | undefined | void;
  onDragMove?: (args: DragHandlerArgs) => void;
  onDragEnd?: (args: DragHandlerArgs) => void;
  cleanup?: () => void;
};

export type PointerConfig = {
  pointerDown?: (element: HTMLElement, handler: PointerEventHandler) => Destructor;
  pointerMove?: (handler: PointerEventHandler) => Destructor;
  pointerUp?: (handler: PointerEventHandler) => Destructor;
  pointerCancel?: (handler: PointerEventHandler) => Destructor;
};

export type DraggableDataFactory = (args: {
  dragElement: HTMLElement;
  dragStartEvent: PointerEvent;
}) => any;

export type Kind = string | symbol;

export type DraggableConfig = {
  disabled?: boolean;
  kind: Kind;
  data: any | DraggableDataFactory;
  shouldDrag?: (args: DragStarHandlerArgs) => boolean;
  onDragStart?: (args: DragStarHandlerArgs) => void;
  onDragEnd?: (args: DragHandlerArgs) => void;
  onDragMove?: (args: DragHandlerArgs) => void;
  pointerConfig?: PointerConfig;
  plugins?: Array<PluginType>;
};

export type DropHandlerArgs = {
  event: PointerEvent;
  sourceType: string | symbol;
  sourceData: any;
  dragStartEvent: PointerEvent;
  dragElement: HTMLElement;
  dropTarget: IDroppable;
  dropTargets: DropTargetsMap;
  dropElement: HTMLElement;
};

export type DropHandler = (args: DropHandlerArgs) => void;

export type DroppableAccepts = (args: {
  kind: string | symbol;
  data: any;
  element: HTMLElement;
  event: PointerEvent;
}) => boolean;

export type DroppableConfig = {
  disabled?: boolean;
  accepts: Kind | Kind[] | DroppableAccepts;
  data?: any;
  onDragIn?: DropHandler;
  onDragOut?: DropHandler;
  onDragMove?: DropHandler;
  onDrop?: DropHandler;
};

export declare class IDraggable {
  constructor(config: DraggableConfig);
  setConfig: (config: DraggableConfig) => void;
  listen: (element: HTMLElement, setAttribute?: boolean) => Destructor;
}

export declare class IDroppable {
  constructor(config: DroppableConfig);
  setConfig: (config: DroppableConfig) => void;
  listen: (element: HTMLElement) => Destructor;
  readonly config: DroppableConfig;
  readonly data: any;
  readonly disabled: boolean;
}
