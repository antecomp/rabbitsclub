import { accessories, eyes, heads } from "./avatar.assets";
import { AvatarData } from "./avatar.types";

const SIZE = 400;
const DEG_TO_RAD = Math.PI / 180;

/** Loads an image asset once the browser resolves its module URL. */
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

const accessoryPromises: Record<string, Promise<HTMLImageElement>> =
    Object.fromEntries(
        Object.entries(accessories).map(([key, { src }]) => [
            key,
            loadImage(src),
        ])
    );

function drawRotatedImage(
    ctx: OffscreenCanvasRenderingContext2D,
    image: HTMLImageElement,
    centerX: number,
    centerY: number,
    rotationDegrees: number
) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationDegrees * DEG_TO_RAD);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
}

/** Creates an offscreen avatar renderer with methods for drawing and exporting the current avatar image. */
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
        const leftImg = await eyePromises[state.leftEye.variant][0];
        const rightImg = await eyePromises[state.rightEye.variant][1];

        const leftBase = eyes[state.leftEye.variant].defaultOffset;
        const rightBase = eyes[state.rightEye.variant].defaultOffset;

        const leftX = (SIZE / 2) + (-leftBase.x) + state.leftEye.offset.x;
        const leftY = (SIZE / 2) + leftBase.y + state.leftEye.offset.y;
        const rightX = (SIZE / 2) + rightBase.x + state.rightEye.offset.x;
        const rightY = (SIZE / 2) + rightBase.y + state.rightEye.offset.y;

        drawRotatedImage(ctx, leftImg, leftX, leftY, state.leftEye.rotation);
        drawRotatedImage(ctx, rightImg, rightX, rightY, state.rightEye.rotation);

        // accessories ---
        for (const accessory of [state.accessory1, state.accessory2]) {
            if (accessory.variant === null) continue;

            const image = await accessoryPromises[accessory.variant];
            const baseOffset = accessories[accessory.variant].defaultOffset;
            const x = (SIZE / 2) + baseOffset.x + accessory.offset.x;
            const y = (SIZE / 2) + baseOffset.y + accessory.offset.y;
            drawRotatedImage(ctx, image, x, y, accessory.rotation);
        }

    }

    async function toImageBitmap() {
        return offscreen.transferToImageBitmap();
    }

    async function toBlob(type = "image/png"): Promise<Blob> {
        return offscreen.convertToBlob({ type });
    }

    async function toContentBlob(type = "image/png"): Promise<Blob> {
        if (!ctx) throw new Error("Unable to get canvas context");
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        let minX = SIZE, minY = SIZE, maxX = 0, maxY = 0;

        /*  TODO: I think we can greatly reduce average-case complexity if we break early.
            The break would need to be per scan direction (top/max, bottom/min, etc...)
            fe...
            let minY = 0;
            top: for (; minY < SIZE; minY++) {
                for (let x = 0; x < SIZE; x++) {
                    if (data[(minY * SIZE + x) * 4 + 3] > 0) break top;
                }
            }
         */
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

    return {
        /** Render current avatar state to offscreen canvas. */
        render,
        /** Exports the current render as an ImageBitmap for fast canvas transfer. */
        toImageBitmap,
        /** Exports the full avatar render as a blob.  */
        toBlob,
        /** Exports a blob cropped to the non-transparent avatar bounds. */
        toContentBlob
    }
}

const renderer = createAvatarRenderer();

/** Renders avatar state to a cropped object URL suitable for img tags.  */
export async function generateAvatarAssetURL(state: AvatarData): Promise<string> {
    await renderer.render(state)
    const blob = await renderer.toContentBlob()
    return URL.createObjectURL(blob)
}
