import React from "react";
import { Kind } from "@snapdrag/core";

export type DropTargetData = {
  data: any;
  element: HTMLElement;
};

export type DraggableConfig = {
  kind: Kind;
  data?: any;
  component?: (args: { data: any; props: Record<string, any> }) => React.ReactElement;
  placeholder?: (args: { data: any, props: Record<string, any> }) => React.ReactElement;
  offset?:
    | { top: number; left: number }
    | ((args: { element: HTMLElement; dragStartEvent: MouseEvent; data: any }) => {
        top: number;
        left: number;
      });
  mapCoords?: (args: {
    top: number;
    left: number;
    event: MouseEvent;
    dragStartEvent: MouseEvent;
    element: HTMLElement;
    data: any;
  }) => { top: number; left: number };
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
  pointerConfig?: any;
  plugins?: any;
};

export type DroppableConfig = {
  disabled?: boolean;
  accepts: Kind | Kind[] | ((props: { kind: Kind; data: any }) => boolean);
  data?: any;
  onDragIn?: (props: {
    kind: Kind;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
  onDragOut?: (props: {
    kind: Kind;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
  onDragMove?: (props: {
    kind: Kind;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
  onDrop?: (props: {
    kind: Kind;
    data: any;
    event: MouseEvent;
    element: HTMLElement;
    dropElement: HTMLElement;
    dropTargets: DropTargetData[];
  }) => void;
};
