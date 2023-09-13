import { PropsWithChildren } from "react";
import type { DragSourceConfig, IDragSourceHandler, IDropTargetHandler } from "./index.class";
import React, { useRef, useCallback } from "react";

type DragSourceProps = PropsWithChildren<{
  handler: IDragSourceHandler<any>;
}>;

type DropTargetProps = PropsWithChildren<{
  handler: IDropTargetHandler<any>;
}>

export const DragSource = React.forwardRef(function DragSource(props: DragSourceProps, componentRef) {
  const { children, handler } = props;

  const child = React.Children.only(children) as any;

  const originalRef = child.ref;

  const destructorRef = useRef<(() => void) | null>(null);

  const childRef = useCallback(
    (element: HTMLElement) => {
      if (destructorRef.current) {
        destructorRef.current();
      }

      if (element) {
        destructorRef.current = handler.startListening(element);
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

export const DropTarget = React.forwardRef(function DropTarget(props: DragSourceProps, componentRef) {
  const { children, handler } = props;

  const child = React.Children.only(children) as any;

  const originalRef = child.ref;

  const destructorRef = useRef<(() => void) | null>(null);

  const childRef = useCallback(
    (element: HTMLElement) => {
      if (destructorRef.current) {
        destructorRef.current();
      }

      if (element) {
        destructorRef.current = handler.startListening(element);
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
})

class DragOverlay extends React.PureComponent<
    { className: string; style: any },
    DragOverlayState
  > {
    state: DragOverlayState = {
      mouseEvent: null,
      renderDragComponent: null,
    };

    componentDidMount(): void {
      overlayComponentInstance = this;
    }

    componentWillUnmount(): void {
      overlayComponentInstance = null;
    }

    setMouseEvent = (event: MouseEvent | null) => {
      this.setState({ mouseEvent: event });
    };

    setRenderDragComponent = (renderDragComponent: any) => {
      this.setState({ renderDragComponent });
    };

    render() {
      const { className, style } = this.props;
      const { mouseEvent, renderDragComponent } = this.state;

      if (!mouseEvent) {
        return null;
      }

      const positionWrapperStyle = {
        position: "absolute",
        transform: `translateX(${mouseEvent.x}px) translateY(${mouseEvent.y}px)`,
      } as const;

      return (
        <div className={className} style={style}>
          <div style={positionWrapperStyle}>
            {renderDragComponent?.({
              event: mouseEvent,
              dropTargets,
              ...startCoords!,
            })}
          </div>
        </div>
      );
    }
  }