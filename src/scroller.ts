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
  let configX = config.x ? getAxisConfig(config.x) : null;
  let configY = config.y ? getAxisConfig(config.y) : null;

  let isMouseDown = false;
  let lastAnimationFrame: number | null = null;
  let lastTimestamp: number = 0;
  let lastMouseX: number = 0;
  let lastMouseY: number = 0;

  function animationLoop(timestamp: number) {
    if (!isMouseDown) {
      return;
    }

    const deltaT = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    let scrollDeltaX = 0;
    let scrollDeltaY = 0;

    if (configX) {
      const windowWidth = window.innerWidth;

      const { threshold, speed, distancePower } = configX;

      const borderDistanceX = Math.max(
        threshold - lastMouseX,
        lastMouseX - (windowWidth - threshold)
      );

      const scrollSpeed =
        Math.pow(Math.min(borderDistanceX / threshold, 1.0), distancePower) * speed;

      const scrollDelta = (scrollSpeed * deltaT) / 1000;

      if (lastMouseX < threshold) {
        scrollDeltaX = -scrollDelta;
      } else if (lastMouseX > windowWidth - threshold) {
        scrollDeltaX = scrollDelta;
      }
    }

    if (configY) {
      const windowHeight = window.innerHeight;

      const { threshold, speed, distancePower } = configY;

      const borderDistanceX = Math.max(
        threshold - lastMouseY,
        lastMouseY - (windowHeight - threshold)
      );

      const scrollSpeed =
        Math.pow(Math.min(borderDistanceX / threshold, 1.0), distancePower) * speed;

      const scrollDelta = (scrollSpeed * deltaT) / 1000;

      if (lastMouseY < threshold) {
        scrollDeltaY = -scrollDelta;
      } else if (lastMouseY > windowHeight - threshold) {
        scrollDeltaY = scrollDelta;
      }
    }

    window.scrollBy(scrollDeltaX, scrollDeltaY);

    lastAnimationFrame = requestAnimationFrame(animationLoop);
  }

  function onStart() {
    isMouseDown = true;
    lastTimestamp = performance.now();
  }

  function onEnd() {
    isMouseDown = false;
    lastTimestamp = 0;

    if (lastAnimationFrame) {
      cancelAnimationFrame(lastAnimationFrame);
    }
  }

  function onMove(e: MouseEvent) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let shouldRun = false;

    if (configX) {
      shouldRun ||= lastMouseX < configX.threshold || lastMouseX > windowWidth - configX.threshold;
    }

    if (configY) {
      shouldRun ||= lastMouseY < configY.threshold || lastMouseY > windowHeight - configY.threshold;
    }

    if (lastAnimationFrame) {
      cancelAnimationFrame(lastAnimationFrame);
    }

    if (shouldRun) {
      lastAnimationFrame = requestAnimationFrame(animationLoop);
    }
  }

  return {
    onStart,
    onEnd,
    onMove,
  };
}
