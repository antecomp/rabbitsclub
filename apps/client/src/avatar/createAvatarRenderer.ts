import { EyeImageEntry, eyes, EyeVariant, heads } from "./assets";
import { AvatarData } from "./avatar.types";

const SIZE = 400;

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

const headPromises = heads.map(loadImage);

const eyePromises: Record<string, [Promise<HTMLImageElement>, Promise<HTMLImageElement>]> =
    Object.fromEntries(
        Object.entries(eyes).map(([key, { src }]) => [
            key,
            Array.isArray(src)
                ? [loadImage(src[0]), loadImage(src[1])]
                : [loadImage(src), loadImage(src)],
        ])
    );

export default function createAvatarRenderer() {
    const offscreen = new OffscreenCanvas(SIZE, SIZE);
    const ctx = offscreen.getContext("2d", { willReadFrequently: true });

    async function render(state: AvatarData) {
        if (!ctx) return;
        ctx.clearRect(0, 0, SIZE, SIZE);

        // head ---
        const head = await headPromises[state.head];
        if (!head) throw new Error("Invalid head index: " + state.head);
        ctx?.drawImage(head, 0, 0, SIZE, SIZE);

        // eyes ---
        const leftImg = await eyePromises[state.leftEye][0];
        const rightImg = await eyePromises[state.rightEye][1];

        const leftBase = eyes[state.leftEye].defaultOffset;
        const rightBase = eyes[state.rightEye].defaultOffset;

        const leftX = (SIZE / 2) + (-leftBase.x) + state.leftEyeOffset.x;
        const leftY = (SIZE / 2) + leftBase.y + state.leftEyeOffset.y;
        const rightX = (SIZE / 2) + rightBase.x + state.rightEyeOffset.x;
        const rightY = (SIZE / 2) + rightBase.y + state.rightEyeOffset.y;

        ctx.drawImage(leftImg, leftX - leftImg.width / 2, leftY - leftImg.height / 2);
        ctx.drawImage(rightImg, rightX - rightImg.width / 2, rightY - rightImg.height / 2);

    }

    async function toImageBitmap() {
        return offscreen.transferToImageBitmap();
    }

    async function toBlob(type = "image/png"): Promise<Blob> {
        return offscreen.convertToBlob({ type });
    }

    async function toContentBlob(type = "image/png"): Promise<Blob> {
        if(!ctx) throw new Error("Unable to get canvas context");
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        let minX = SIZE, minY = SIZE, maxX = 0, maxY = 0;

        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                const alpha = data[(y * SIZE + x) * 4 + 3];
                if (alpha > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        const temp = new OffscreenCanvas(w, h);
        temp.getContext("2d")!.drawImage(offscreen, minX, minY, w, h, 0, 0, w, h);
        return temp.convertToBlob({ type });
    }

    return { render, toImageBitmap, toBlob, toContentBlob }
}

const renderer = createAvatarRenderer();

const urlCache = new Map<string, string>();

export async function getAvatarUrl(state: AvatarData): Promise<string> {
  const key = JSON.stringify(state);
  if (urlCache.has(key)) return urlCache.get(key)!;
  await renderer.render(state);
  const blob = await renderer.toContentBlob();
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}