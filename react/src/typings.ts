import React from "react";

export type Kind = string | symbol;

export type DropTargetData = {
  data: any;
  element: HTMLElement;
};

export type DraggableConfig = {
  kind: Kind;
  data?: any;
  component?: (args: { data: any }) => React.ReactElement;
  placeholder?: (args: { data: any }) => React.ReactElement;
  offset?:
    | { top: number; left: number }
    | ((args: { element: HTMLElement; event: MouseEvent; data: any }) => {
        top: number;
        left: number;
      });
  shouldDrag?: (args: {
    event: MouseEvent;
    dragStartEvent: MouseEvent;
    element: HTMLElement;
    data: any;
  }) => boolean;
  onDragStart?: (args: {
    event: MouseEvent;
    dragStartEvent: MouseEvent;
    element: HTMLElement;
    data: any;
  }) => void;
  onDragMove?: (args: {
    event: MouseEvent;
    dragStartEvent: MouseEvent;
    dropTargets: DropTargetData[];
    element: HTMLElement;
    data: any;
    top: number;
    left: number;
  }) => void;
  onDragEnd?: (args: {
    event: MouseEvent;
    dragStartEvent: MouseEvent;
    dropTargets: DropTargetData[];
    element: HTMLElement;
    data: any;
  }) => void;
  move?: boolean;
  disabled?: boolean;
  mouseConfig?: any;
  plugins?: any;
};

export type DroppableConfig = {
  disabled?: boolean;
  accepts: Kind | Kind[] | ((props: { kind: string; data: any }) => boolean);
  data?: any;
  onDragIn?: (props: {
    kind: string;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
  onDragOut?: (props: {
    kind: string;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
  onDragMove?: (props: {
    kind: string;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
  onDrop?: (props: {
    kind: string;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
};
