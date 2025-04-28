import React, { useRef, useState, useMemo, useCallback } from "react";
import { DragSourceType, DropTargetConfig, createDropTarget } from "snapdrag/core";
import { DroppableConfig, Kind } from "./typings";
import { getDropTargets } from "./utils/getDropTargets";

type HoveredData = {
  kind: Kind;
  data: any;
  element: HTMLElement;
  dropElement: HTMLElement;
};

export function useDroppable(config: DroppableConfig) {
  const [hovered, setHovered] = useState<HoveredData | null>(null);

  let { accepts } = config;

  const trueAccepts = Array.isArray(accepts) || typeof accepts === "function" ? accepts : [accepts];

  const trueConfig: DropTargetConfig<any> = {
    disabled: config.disabled,
    accepts: trueAccepts as unknown as DragSourceType<any>[],
    data: config.data,
    onDragIn(props) {
      setHovered({
        kind: props.sourceType,
        data: props.sourceData,
        element: props.dragElement,
        dropElement: props.dropElement,
      });

      config.onDragIn?.({
        kind: props.sourceType,
        data: props.sourceData,
        event: props.event,
        element: props.dragElement,
        dropElement: props.dropElement,
        dropTargets: getDropTargets(props.dropTargets),
      });
    },
    onDragOut(props) {
      setHovered(null);

      config.onDragOut?.({
        kind: props.sourceType,
        data: props.sourceData,
        event: props.event,
        element: props.dragElement,
        dropElement: props.dropElement,
        dropTargets: getDropTargets(props.dropTargets),
      });
    },
    onDragMove(props) {
      config.onDragMove?.({
        kind: props.sourceType,
        data: props.sourceData,
        event: props.event,
        element: props.dragElement,
        dropElement: props.dropElement,
        dropTargets: getDropTargets(props.dropTargets),
      });
    },
    onDrop(props) {
      setHovered(null);

      config.onDrop?.({
        kind: props.sourceType,
        data: props.sourceData,
        event: props.event,
        element: props.dragElement,
        dropElement: props.dropElement,
        dropTargets: getDropTargets(props.dropTargets),
      });
    },
  };

  const dropTarget = useMemo(() => createDropTarget(trueConfig), []);

  dropTarget.setConfig(trueConfig);

  const originalRef = useRef(null as any);

  const dropComponentRef = useCallback((element: HTMLElement | null) => {
    if (element) {
      dropTarget.listen(element);
    }

    const ref = originalRef.current;

    if (typeof ref === "function") {
      ref(element);
    } else if (ref && ref.hasOwnProperty("current")) {
      ref.current = element;
    }
  }, []);

  const droppable = useCallback(
    (child: React.ReactElement<React.ComponentPropsWithRef<any>> | null) => {
      if (!child) {
        return null;
      }

      // @ts-ignore React 16-19+ refs compatibility.
      originalRef.current = child.props?.ref ?? child.ref;

      return React.cloneElement(child, { ref: dropComponentRef });
    },
    []
  );

  return {
    droppable,
    hovered,
  };
}
