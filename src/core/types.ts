export declare class IDragSource<T extends DragSourceType<any>> {
  constructor(config: DragSourceConfig<T>);
  setConfig: (config: DragSourceConfig<T>) => void;
  listen: (element: HTMLElement, setAttribute?: boolean) => Destructor;
}

export declare class IDropTarget<T> {
  constructor(config: DropTargetConfig<T>);
  setConfig: (config: DropTargetConfig<T>) => void;
  listen: (element: HTMLElement) => Destructor;
  readonly config: DropTargetConfig<T>;
  readonly data: any;
  readonly disabled: boolean;
}

export type DragSourceType<Data> = symbol & { __data: Data; };

export type DragSourceDataType<SourceType> = SourceType extends DragSourceType<infer DataType> ? DataType : never;

export type MouseEventHandler = (event: MouseEvent) => void;

export type Destructor = () => void;

export type DragStarHandlertArgs<T = any> = {
  dragElement: HTMLElement;
  dragStartEvent: MouseEvent;
  data?: DragSourceDataType<T>;
};

export type DropTargetsMap = Map<Element, IDropTarget<any>>;

type DragHandlerArgs<T = any> = {
  event: MouseEvent;
  dragElement: HTMLElement;
  dragStartEvent: MouseEvent;
  dropTargets: DropTargetsMap;
  data?: DragSourceDataType<T>;
};

export type PluginType = {
  onDragStart?: (args: DragStarHandlertArgs) => boolean | undefined | void;
  onDragMove?: (args: DragHandlerArgs) => void;
  onDragEnd?: (args: DragHandlerArgs) => void;
  cleanup?: () => void;
};

export type MouseConfig = {
  mouseDown?: (element: HTMLElement, handler: MouseEventHandler) => Destructor;
  mouseMove?: (handler: MouseEventHandler) => Destructor;
  mouseUp?: (handler: MouseEventHandler) => Destructor;
};

export type DragSourceDataFactory<T> = (args: {
  dragElement: HTMLElement;
  dragStartEvent: MouseEvent;
}) => DragSourceDataType<T>;

export type DragSourceConfig<T extends DragSourceType<any>> = {
  disabled?: boolean;
  type: T;
  data: DragSourceDataType<T> | DragSourceDataFactory<T>;
  shouldDrag?: (args: DragStarHandlertArgs<T>) => boolean;
  onDragStart?: (args: DragStarHandlertArgs<T>) => void;
  onDragEnd?: (args: DragHandlerArgs<T>) => void;
  onDragMove?: (args: DragHandlerArgs<T>) => void;
  mouseConfig?: MouseConfig;
  plugins?: Array<PluginType>;
};

export type DropHandlerArgs<T> = {
  event: MouseEvent;
  sourceType: T;
  sourceData: DragSourceDataType<T>;
  dragStartEvent: MouseEvent;
  dragElement: Element;
  dropTarget: IDropTarget<T>;
  dropTargets: DropTargetsMap;
  dropElement: Element;
};

export type DropHandler<T> = (args: DropHandlerArgs<T>) => void;

export type DropTargetConfig<T> = {
  disabled?: boolean;
  sourceTypes: Array<T>;
  data?: any;
  shouldAccept?: (args: DropHandlerArgs<T>) => boolean;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};
