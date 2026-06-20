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
    const ctx = offscreen.getContext("2d");

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

    return { render, toImageBitmap, toBlob }
}