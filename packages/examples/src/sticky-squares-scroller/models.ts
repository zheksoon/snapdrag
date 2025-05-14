import { observable } from "onek";
import { makeObservable } from "onek/mobx";

let idx = 0;

export class SquareModel {
  index: number;

  constructor(public x: number, public y: number, public color: string) {
    this.x = observable.prop(x);
    this.y = observable.prop(y);
    this.color = observable.prop(color);

    this.index = ++idx;

    makeObservable(this);
  }
}

export const squares = Array.from(
  { length: 100 },
  () =>
    new SquareModel(
      Math.random() * 1000,
      Math.random() * 4000,
      // @ts-ignore
      "#" + (Math.random() * 256 ** 3).toFixed(10).toString(16).slice(0, 6)
    )
);
