import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react";
import {
  DragSourceConfig,
  DragSourceType,
  DropTargetConfig,
  createDragSource,
  createDropTarget,
} from "snapdrag";

type DragSourceProps = PropsWithChildren<{
  config: DragSourceConfig<any>;
}>;

type DropTargetProps = PropsWithChildren<{
  config: DropTargetConfig<any>;
}>;

export const WithDragSource = React.forwardRef(function DragSource(
  props: DragSourceProps,
  componentRef: any
) {
  const { children, config } = props;

  const child = React.Children.only(children) as any;

  const originalRef = child.ref;

  const dragSource = useMemo(() => createDragSource(config), []);

  const dragSourceDestructor = useRef<(() => void) | null>(null);

  useEffect(() => {
    dragSource.setConfig(config);
  }, [config]);

  const childRef = useCallback(
    (element: HTMLElement) => {
      if (dragSourceDestructor.current) {
        dragSourceDestructor.current();
      }

      if (element) {
        dragSourceDestructor.current = dragSource.listen(element);
      }

      if (typeof originalRef === "function") {
        originalRef(element);
      } else if (originalRef && originalRef.hasOwnProperty("current")) {
        originalRef.current = element;
      }

      if (typeof componentRef === "function") {
        componentRef(element);
      } else if (componentRef && componentRef.hasOwnProperty("current")) {
        componentRef.current = element;
      }
    },
    [originalRef]
  );

  return React.cloneElement(child, { ref: childRef });
});

export const WithDropTarget = React.forwardRef(function DropTarget(
  props: DropTargetProps,
  componentRef: any
) {
  const { children, config } = props;

  const child = React.Children.only(children) as any;

  const originalRef = child.ref;

  const dropTarget = useMemo(() => createDropTarget(config), []);

  const dropTargetDestructor = useRef<(() => void) | null>(null);

  useEffect(() => {
    dropTarget.setConfig(config);
  }, [config]);

  const childRef = useCallback(
    (element: HTMLElement) => {
      if (dropTargetDestructor.current) {
        dropTargetDestructor.current();
      }

      if (element) {
        dropTargetDestructor.current = dropTarget.listen(element);
      }

      if (typeof originalRef === "function") {
        originalRef(element);
      } else if (originalRef && originalRef.hasOwnProperty("current")) {
        originalRef.current = element;
      }

      if (typeof componentRef === "function") {
        componentRef(element);
      } else if (componentRef && componentRef.hasOwnProperty("current")) {
        componentRef.current = element;
      }
    },
    [originalRef]
  );

  return React.cloneElement(child, { ref: childRef });
});

export function useDragSource<T extends DragSourceType<T>>(config: DragSourceConfig<T>) {
  return (component: React.ReactElement) => {
    return <WithDragSource config={config}>{component}</WithDragSource>;
  };
}

export function useDropTarget<T>(config: DropTargetConfig<T>) {
  return (component: React.ReactElement) => {
    return <WithDropTarget config={config}>{component}</WithDropTarget>;
  };
}
