/** Simple playSound that best-effort loads, plays, then destroys an audio instance.
 * Consider using playSound from audio.ts for repeated sounds or sounds that should be buffered.
 * @returns A Promise that resolves when the sound *ends*
 */
export async function playSoundOnce(src: string, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        if(volume) audio.volume = volume;
        audio.addEventListener("ended", () => resolve(), {once: true});
        audio.addEventListener("error", () => reject(), {once: true});
        audio.play().catch(reject);
    })
}
