// AvatarCanvas.tsx
import { createEffect, createSignal, onMount } from "solid-js";
import createAvatarRenderer from "./createAvatarRenderer";
import { AvatarData } from "./avatar.types";

interface Props {
  state: AvatarData;
  size?: number;
}

export function AvatarCanvas(props: Props) {
  const [src, setSrc] = createSignal<string>();
  const renderer = createAvatarRenderer();
  let prevUrl: string | undefined;

  async function sync() {
    await renderer.render(props.state);
    const blob = await renderer.toBlob();
    const url = URL.createObjectURL(blob);
    setSrc(url);
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    prevUrl = url;
  }

  onMount(sync);
  createEffect(() => { props.state.head; sync(); });

  return (
    <img
      src={src()}
      width={props.size ?? 400}
      height={props.size ?? 400}
    />
  );
}