import { createEffect, onCleanup } from "solid-js";
import createAvatarRenderer from "./createAvatarRenderer";
import { AvatarData } from "./avatar.types";

export function AvatarCanvas(props: {
  state: AvatarData;
  size?: number;
}) {
  const renderer = createAvatarRenderer();
  let canvas!: HTMLCanvasElement;
  let queuedState: AvatarData | undefined;
  let isRendering = false;
  let isDisposed = false;

  async function renderQueued() {
    if (isRendering) return;

    isRendering = true;
    try {
      while (queuedState && !isDisposed) {
        const state = queuedState;
        queuedState = undefined;

        await renderer.render(state);
        const bitmap = await renderer.toImageBitmap();

        if (queuedState || isDisposed) {
          bitmap.close();
          continue;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          return;
        }

        const size = props.size ?? 400;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(bitmap, 0, 0, size, size);
        bitmap.close();
      }
    } finally {
      isRendering = false;
      if (queuedState && !isDisposed) void renderQueued();
    }
  }

  createEffect(() => {
    queuedState = props.state;
    void renderQueued();
  });

  onCleanup(() => {
    isDisposed = true;
  });

  return (
    <canvas
      ref={canvas}
      width={props.size ?? 400}
      height={props.size ?? 400}
    />
  );
}
