export type DragSourceType<Data> = symbol & { __data: Data };

export type DragSourceDataType<SourceType> = SourceType extends DragSourceType<
  infer DataType
>
  ? DataType
  : never;

type DragSourceTypesToUnion<SourceTypeArray extends any[]> = {
  [K in keyof SourceTypeArray]: DragSourceDataType<SourceTypeArray[K]>;
}[number];

export type MouseEventHandler = (event: MouseEvent) => void;

export type Destructor = () => void;

export type DropTargetsMap = Map<HTMLElement, IDropTarget<any>>;

export type DragStarHandlerArgs<T = any> = {
  dragElement: HTMLElement;
  dragStartEvent: MouseEvent;
  data?: DragSourceDataType<T>;
};

type DragHandlerArgs<T = any> = {
  event: MouseEvent;
  dragElement: HTMLElement;
  dragStartEvent: MouseEvent;
  dropTargets: DropTargetsMap;
  data?: DragSourceDataType<T>;
};

export type PluginType = {
  onDragStart?: (args: DragStarHandlerArgs) => boolean | undefined | void;
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
  shouldDrag?: (args: DragStarHandlerArgs<T>) => boolean;
  onDragStart?: (args: DragStarHandlerArgs<T>) => void;
  onDragEnd?: (args: DragHandlerArgs<T>) => void;
  onDragMove?: (args: DragHandlerArgs<T>) => void;
  mouseConfig?: MouseConfig;
  plugins?: Array<PluginType>;
};

export type DropHandlerArgs<T extends Array<DragSourceType<any>>> = {
  event: MouseEvent;
  sourceType: T[number];
  sourceData: DragSourceTypesToUnion<T>;
  dragStartEvent: MouseEvent;
  dragElement: HTMLElement;
  dropTarget: IDropTarget<T>;
  dropTargets: DropTargetsMap;
  dropElement: HTMLElement;
};

export type DropHandler<T extends Array<DragSourceType<any>>> = (
  args: DropHandlerArgs<T>
) => void;

export type DropTargetConfig<T extends Array<DragSourceType<any>>> = {
  disabled?: boolean;
  sourceTypes: T;
  data?: any;
  shouldAccept?: (args: DropHandlerArgs<T>) => boolean;
  onDragIn?: DropHandler<T>;
  onDragOut?: DropHandler<T>;
  onDragMove?: DropHandler<T>;
  onDrop?: DropHandler<T>;
};

export declare class IDragSource<T extends DragSourceType<any>> {
  constructor(config: DragSourceConfig<T>);
  setConfig: (config: DragSourceConfig<T>) => void;
  listen: (element: HTMLElement, setAttribute?: boolean) => Destructor;
}

export declare class IDropTarget<T extends Array<DragSourceType<any>>> {
  constructor(config: DropTargetConfig<T>);
  setConfig: (config: DropTargetConfig<T>) => void;
  listen: (element: HTMLElement) => Destructor;
  readonly config: DropTargetConfig<T>;
  readonly data: any;
  readonly disabled: boolean;
}
