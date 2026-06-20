import { heads } from "./assets";
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

export default function createAvatarRenderer() {
    const offscreen = new OffscreenCanvas(SIZE, SIZE);
    const ctx = offscreen.getContext("2d");

    async function render(state: AvatarData) {
        ctx?.clearRect(0, 0, SIZE, SIZE);
        const prom = await headPromises[state.head];
        if (!prom) throw new Error("HEAD INDEX");
        ctx?.drawImage(prom, 0, 0, SIZE, SIZE);
    }

    async function toImageBitmap() {
        return offscreen.transferToImageBitmap();
    }

    function toDataURL(type = "image/png"): string {
        const temp = document.createElement("canvas");
        temp.width = SIZE;
        temp.height = SIZE;
        temp.getContext("2d")!.drawImage(offscreen, 0, 0);
        return temp.toDataURL(type);
    }

    async function toBlob(type = "image/png"): Promise<Blob> {
        return offscreen.convertToBlob({ type });
    }

    return { render, toImageBitmap, toDataURL, toBlob }
}