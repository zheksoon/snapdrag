import { PluginType } from "./snapdrag";

type AxisConfig = {
  threshold?: number;
  speed?: number;
  distancePower?: number;
};

type ScrollerConfig = {
  x?: AxisConfig | boolean;
  y?: AxisConfig | boolean;
};

const defaultAxisConfig: AxisConfig = {
  threshold: 100,
  speed: 2000,
  distancePower: 1.5,
};

function getAxisConfig(axisConfig: AxisConfig | boolean) {
  if (typeof axisConfig === "boolean") {
    return { ...defaultAxisConfig } as Required<AxisConfig>;
  }

  return { ...defaultAxisConfig, ...axisConfig } as Required<AxisConfig>;
}

export function createScroller(config: ScrollerConfig) {
  return function Scroller(container): PluginType {
    const configX = config.x ? getAxisConfig(config.x) : null;
    const configY = config.y ? getAxisConfig(config.y) : null;

    let isMouseDown = false;
    let lastAnimationFrame: number | null = null;
    let lastTimestamp: number = 0;
    let lastMouseX: number = 0;
    let lastMouseY: number = 0;
    let scale = 1.0;

    function getContainerBoundingRect() {
      if (container instanceof Window) {
        return {
          top: 0,
          left: 0,
          bottom: container.innerHeight,
          right: container.innerWidth,
        };
      } else {
        let { top, bottom, left, right } = container.getBoundingClientRect();

        return {
          top: top * scale,
          bottom: bottom * scale,
          left: left * scale,
          right: right * scale,
        };
      }
    }

    function animationLoop(timestamp: number) {
      if (!isMouseDown) {
        return;
      }

      const deltaT = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      let scrollDeltaX = 0;
      let scrollDeltaY = 0;

      const { top, bottom, left, right } = getContainerBoundingRect();

      if (configX) {
        const { threshold, speed, distancePower } = configX;

        const borderDistanceX = Math.max(
          threshold + left - lastMouseX,
          threshold - right + lastMouseX
        );

        const scrollSpeed =
          Math.pow(Math.min(borderDistanceX / threshold, 1.0), distancePower) * speed;

        const scrollDelta = (scrollSpeed * deltaT) / 1000;

        if (lastMouseX < threshold - left) {
          scrollDeltaX = -scrollDelta;
        } else if (lastMouseX > right - threshold) {
          scrollDeltaX = scrollDelta;
        }
      }

      if (configY) {
        const { threshold, speed, distancePower } = configY;

        const borderDistanceX = Math.max(
          threshold + top - lastMouseY,
          threshold - bottom + lastMouseY
        );

        const scrollSpeed =
          Math.pow(Math.min(borderDistanceX / threshold, 1.0), distancePower) * speed;

        const scrollDelta = (scrollSpeed * deltaT) / 1000;

        if (lastMouseY < threshold - top) {
          scrollDeltaY = -scrollDelta;
        } else if (lastMouseY > bottom - threshold) {
          scrollDeltaY = scrollDelta;
        }
      }

      container.scrollBy(scrollDeltaX, scrollDeltaY);

      lastAnimationFrame = requestAnimationFrame(animationLoop);
    }

    function onDragStart() {
      isMouseDown = true;
      lastTimestamp = performance.now();
    }

    function onDragEnd() {
      isMouseDown = false;
      lastTimestamp = 0;

      if (lastAnimationFrame) {
        cancelAnimationFrame(lastAnimationFrame);
      }
    }

    function onDragMove({ event }: { event: UIEvent }) {
      const ratio = window.devicePixelRatio;
      const viewportScale = window.visualViewport ? window.visualViewport.scale : 1;

      scale = ratio / viewportScale;

      lastMouseX = (event as MouseEvent).x * scale;
      lastMouseY = (event as MouseEvent).y * scale;

      const { top, bottom, left, right } = getContainerBoundingRect();

      let shouldRun = false;

      if (configX) {
        shouldRun ||=
          lastMouseX < configX.threshold + left || lastMouseX > right - configX.threshold;
      }

      if (configY) {
        shouldRun ||=
          lastMouseY < configY.threshold + top || lastMouseY > bottom - configY.threshold;
      }

      if (lastAnimationFrame) {
        cancelAnimationFrame(lastAnimationFrame);
      }

      if (shouldRun) {
        lastAnimationFrame = requestAnimationFrame(animationLoop);
      }
    }

    return {
      onDragStart,
      onDragEnd,
      onDragMove,
    };
  };
}
