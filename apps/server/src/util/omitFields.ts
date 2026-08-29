/**
 * Create a shallow copy of an object without the specified fields.
 */
export function omitFields<
    T extends Record<string, unknown>,
    const K extends readonly (keyof T)[]
>(
    source: T,
    keys: K
): Omit<T, K[number]> {
    const result: Partial<T> = { ...source };

    for (const key of keys)
        delete result[key];

    return result as Omit<T, K[number]>;
}