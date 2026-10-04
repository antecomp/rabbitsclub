/**
 * Create a new object containing only the specified keys from the source.
 *
 * Example:
 *   const src = { a: 1, b: 2, c: 3 };
 *   const picked = pickFields(src, ["a", "c"] as const); // { a: 1, c: 3 }
 *
 * @param source - The source object to pick fields from.
 * @param keys - An array of keys (preferably as const) to pick from the source.
 * @returns A new object with only the requested keys and their values.
 */
export function pickFields<
    T extends Record<string, unknown>,
    const K extends readonly (keyof T)[]
>(
    source: T,
    keys: K
): Pick<T, K[number]> {
    return Object.fromEntries(
        keys.map(key => [key, source[key]])
    ) as Pick<T, K[number]>;
}