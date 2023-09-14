import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { DragSourceConfig, DropTargetConfig, createDragSource, createDropTarget } from "./index";
import React, { useRef, useCallback } from "react";

type DragSourceProps = PropsWithChildren<{
  config: DragSourceConfig<any>;
}>;

type DropTargetProps = PropsWithChildren<{
  config: DropTargetConfig<any>;
}>;

export const DragSource = React.forwardRef(function DragSource(
  props: DragSourceProps,
  componentRef: any
) {
  const { children, config } = props;

  const child = React.Children.only(children) as any;

  const originalRef = child.ref;

  const [element, setElement] = useState<HTMLElement | null>(null);

  const dragSource = useMemo(() => createDragSource(config), []);

  useEffect(() => {
    if (element) {
      const destructor = dragSource.apply(element);

      return destructor;
    }
  }, [element]);

  useEffect(() => {
    dragSource.setConfig(config);
  }, [config]);

  const childRef = useCallback(
    (element: HTMLElement) => {
      setElement(element);

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

export const DropTarget = React.forwardRef(function DropTarget(
  props: DropTargetProps,
  componentRef: any
) {
  const { children, config } = props;

  const child = React.Children.only(children) as any;

  const originalRef = child.ref;

  const [element, setElement] = useState<HTMLElement | null>(null);

  const dragSource = useMemo(() => createDropTarget(config), []);

  useEffect(() => {
    if (element) {
      const destructor = dragSource.apply(element);

      return destructor;
    }
  }, [element]);

  useEffect(() => {
    dragSource.setConfig(config);
  }, [config]);

  const childRef = useCallback(
    (element: HTMLElement) => {
      setElement(element);

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
