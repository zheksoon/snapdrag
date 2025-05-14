import React from "react";
import { useObserver } from "onek/react";
import { SquareModel } from "./models";

type SquareProps = {
  model: SquareModel;
  style?: Record<string, any>;
};

export const Square = React.forwardRef<HTMLDivElement, SquareProps>(
  ({ model, style = {} }, ref) => {
    const observer = useObserver();

    return observer(() => {
      const squareStyle = {
        width: 100,
        height: 100,
        backgroundColor: model.color,
        userSelect: "none",
        ...style,
      } as const;

      return <div ref={ref} className="square" style={squareStyle}></div>;
    });
  }
);
