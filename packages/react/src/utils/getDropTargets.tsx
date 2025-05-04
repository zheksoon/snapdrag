import { DropTargetsMap } from "@snapdrag/core";
import { DropTargetData } from "../typings";

export function getDropTargets(dropTargets: DropTargetsMap) {
  const result = [] as Array<DropTargetData>;

  dropTargets.forEach((target, element) => {
    result.push({
      data: target.data,
      element,
    });
  });

  return result;
}
