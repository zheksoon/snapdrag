import React, { useRef, useState, useMemo, useCallback, ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  DraggableConfig as DraggableCoreConfig,
  DragStarHandlerArgs,
  createDraggable,
  PluginType,
  DRAGGABLE_ATTRIBUTE,
} from "@snapdrag/core";
import { DraggableConfig } from "./types";
import { setDragElementPosition, OVERLAY_ID, setOverlayVisible } from "./Overlay";
import { getDropTargets } from "./utils/getDropTargets";

const DragComponent = React.forwardRef<HTMLElement, React.ComponentPropsWithRef<any>>(
  ({ dragComponent, placeholderComponent }, ref) => {
    const dragComponentWithRef = React.cloneElement(dragComponent, { ref });

    return (
      <>
        {placeholderComponent}
        {createPortal(dragComponentWithRef, document.getElementById(OVERLAY_ID)!)}
      </>
    );
  }
);

export function useDraggable(config: DraggableConfig) {
  const [isDragging, setIsDragging] = useState(false);
  const [data, setData] = useState<any>(null);

  const refs = useRef({
    dragElementSnapshot: null as React.ReactElement | null,
    dragElement: null as HTMLElement | null,
    element: null as HTMLElement | null,
    elementOffset: { top: 0, left: 0 },
    originalRef: null as any,
    isDragging: false,
    config,
    data: null as any,
    draggableByDefault: true,
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

  const draggableCoreConfig: DraggableCoreConfig = {
    disabled: config.disabled,
    kind: config.kind,
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
            dragStartEvent: props.dragStartEvent,
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
      current.isDragging = true;
      current.data = props.data;

      setOverlayVisible(true);
      setDragElementPosition({ top, left });
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

      let top = elementOffset.top + props.event.clientY;
      let left = elementOffset.left + props.event.clientX;

      if (config.mapCoords) {
        const coords = config.mapCoords({
          top,
          left,
          event: props.event,
          dragStartEvent: props.dragStartEvent,
          element: refs.current.dragElement!,
          data: props.data,
        });

        top = coords.top;
        left = coords.left;
      }

      setDragElementPosition({ top, left });

      const dropTargets = getDropTargets(props.dropTargets);

      config.onDragMove?.({
        event: props.event,
        dragStartEvent: props.dragStartEvent,
        element: refs.current.dragElement!,
        top,
        left,
        dropTargets,
        data: props.data,
      });
    },
    onDragEnd(props) {
      const current = refs.current;

      const top = current.elementOffset.top + props.event.clientY;
      const left = current.elementOffset.left + props.event.clientX;

      current.dragElementSnapshot = null;
      current.isDragging = false;
      current.elementOffset = { top: 0, left: 0 };

      setOverlayVisible(false);
      setIsDragging(false);
      setData(null);
      setDragElementPosition({ top: 0, left: 0 });

      const dropTargets = getDropTargets(props.dropTargets);

      config.onDragEnd?.({
        top,
        left,
        event: props.event,
        dragStartEvent: props.dragStartEvent,
        element: refs.current.dragElement!,
        data: props.data,
        dropTargets,
      });
    },
    pointerConfig: config.pointerConfig,
    plugins: config.plugins as PluginType[],
  };

  const dragSource = useMemo(() => createDraggable(draggableCoreConfig), []);

  dragSource.setConfig(draggableCoreConfig);

  const componentRef = useCallback(
    (element: HTMLElement | null) => {
      const current = refs.current;

      if (element) {
        current.element = element;

        dragSource.listen(element);

        if (!refs.current.draggableByDefault) {
          element.setAttribute(DRAGGABLE_ATTRIBUTE, "false");
        }
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

        if (!refs.current.draggableByDefault) {
          element.setAttribute(DRAGGABLE_ATTRIBUTE, "false");
        }
      }

      refs.current.dragElement = element;
    },
    [dragSource]
  );

  const draggable = useCallback(
    (child: React.ReactElement<React.ComponentPropsWithRef<any>>) => {
      if (!child) {
        return null;
      }

      const current = refs.current;

      // @ts-ignore React 16-19+ refs compatibility.
      current.originalRef = child.props?.ref ?? child.ref;

      const clone = React.cloneElement(child, { ref: componentRef });

      if (!current.dragElementSnapshot) {
        current.dragElementSnapshot = clone;
      }

      if (current.isDragging) {
        let dragComponent =
          current.config.component?.({ data: current.data, props: child.props }) ?? child;

        dragComponent = React.cloneElement(dragComponent, { ref: dragComponentRef });

        let placeholderComponent: ReactElement | null = current.dragElementSnapshot;

        if (current.config.placeholder) {
          placeholderComponent =
            current.config.placeholder?.({ data: current.data, props: child.props }) ?? null;
        }

        if (current.config.move) {
          placeholderComponent = null;
        }

        return (
          <DragComponent
            dragComponent={dragComponent}
            placeholderComponent={placeholderComponent}
          />
        );
      }

      return clone;
    },
    [componentRef, dragComponentRef]
  );

  const handleRef = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.setAttribute(DRAGGABLE_ATTRIBUTE, "true");
    }
  }, []);

  const dragHandle = useCallback(
    (component: React.ReactElement<React.ComponentPropsWithRef<any>>) => {
      if (!component) {
        return null;
      }

      refs.current.draggableByDefault = false;

      return React.cloneElement(component, {
        ref: handleRef,
      });
    },
    []
  );

  return {
    draggable,
    dragHandle,
    isDragging,
    data,
  };
}
