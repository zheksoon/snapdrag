import React, { useRef, useState, useMemo, useCallback } from "react";
import { DragSourceConfig, DragStarHandlerArgs, createDragSource } from "snapdrag/core";
import { DraggableConfig } from "./typings";
import { setDragElementPosition, setDragElement } from "./Overlay";
import { getDropTargets } from "./utils/getDropTargets";

export function useDraggable(config: DraggableConfig) {
  const [isDragging, setIsDragging] = useState(false);
  const [data, setData] = useState<any>(null);

  const refs = useRef({
    dragElementSnapshot: null as React.ReactElement | null,
    element: null as HTMLElement | null,
    elementOffset: { top: 0, left: 0 },
    originalRef: null as any,
    isDragging: false,
    config,
    data: null as any,
  });

  refs.current.config = config;

  const shouldDrag = (props: DragStarHandlerArgs) => {
    const shouldDrag = config.shouldDrag?.({
      event: props.event,
      dragStartEvent: props.dragStartEvent,
      element: props.dragElement,
      data: props.data,
    });

    return !!shouldDrag;
  };

  const trueConfig: DragSourceConfig<any> = {
    disabled: config.disabled,
    type: config.kind,
    data: config.data,
    shouldDrag: config.shouldDrag && shouldDrag,
    onDragStart(props) {
      const current = refs.current;

      const { top, left } = current.element!.getBoundingClientRect();

      let offset;

      if (current.config.offset) {
        if (typeof current.config.offset === "function") {
          offset = current.config.offset({
            element: current.element!,
            event: props.dragStartEvent,
            data: props.data,
          });
        } else {
          offset = current.config.offset;
        }
      } else {
        offset = {
          top: top - props.dragStartEvent.clientY,
          left: left - props.dragStartEvent.clientX,
        };
      }

      current.elementOffset = offset;

      setDragElementPosition({ top, left });

      current.isDragging = true;

      current.data = props.data;

      setIsDragging(true);
      setData(props.data);

      config.onDragStart?.({
        element: props.dragElement,
        event: props.dragStartEvent,
        dragStartEvent: props.dragStartEvent,
        data: props.data,
      });
    },
    onDragMove(props) {
      const { elementOffset } = refs.current;

      const top = elementOffset.top + props.event.clientY;
      const left = elementOffset.left + props.event.clientX;

      setDragElementPosition({ top, left });

      const dropTargets = getDropTargets(props.dropTargets);

      config.onDragMove?.({
        event: props.event,
        dragStartEvent: props.dragStartEvent,
        element: props.dragElement,
        dropTargets,
        data: props.data,
        top,
        left,
      });
    },
    onDragEnd(props) {
      const current = refs.current;

      current.dragElementSnapshot = null;

      current.isDragging = false;

      current.elementOffset = { top: 0, left: 0 };

      setIsDragging(false);

      setData(null);

      setDragElementPosition({ top: 0, left: 0 });

      setDragElement(null);

      const dropTargets = getDropTargets(props.dropTargets);

      config.onDragEnd?.({
        event: props.event,
        dragStartEvent: props.dragStartEvent,
        element: props.dragElement,
        data: props.data,
        dropTargets,
      });
    },
    mouseConfig: config.mouseConfig,
    plugins: config.plugins,
  };

  const dragSource = useMemo(() => createDragSource(trueConfig), []);

  dragSource.setConfig(trueConfig);

  const componentRef = useCallback(
    (element: HTMLElement | null) => {
      const current = refs.current;

      if (element) {
        current.element = element;

        dragSource.listen(element);
      }

      const ref = current.originalRef;

      if (typeof ref === "function") {
        ref(element);
      } else if (ref && ref.hasOwnProperty("current")) {
        ref.current = element;
      }
    },
    [dragSource]
  );

  const dragComponentRef = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        dragSource.listen(element);
      }
    },
    [dragSource]
  );

  const draggable = useCallback(
    (child: React.ReactElement) => {
      if (!child) {
        return null;
      }

      const current = refs.current;

      // @ts-ignore
      current.originalRef = child.ref;

      const clone = React.cloneElement(child, { ref: componentRef });

      current.dragElementSnapshot ??= clone;

      if (current.isDragging) {
        let dragComponent = current.config.component?.({ data: current.data }) ?? child;

        dragComponent = React.cloneElement(dragComponent, { ref: dragComponentRef });

        setDragElement(dragComponent);

        if (current.config.placeholder) {
          return current.config.placeholder?.({ data: current.data }) ?? null;
        }

        if (current.config.move) {
          return null;
        }

        return current.dragElementSnapshot;
      }

      return clone;
    },
    [componentRef, dragComponentRef]
  );

  return {
    draggable,
    isDragging,
    data,
  };
}
