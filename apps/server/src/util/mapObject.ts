/**
 * Utility function to map an object to a new object with some mapper function.
 * @param obj Input object of form `{key: T}`
 * @param fn Mapper function to transform object. Takes `(value, key, obj)` where...
 *           - `value: T` is the current value.
 *           - `key` is the current key.
 *           - `obj` is the whole input object.
 * @returns Mapped object.
 */
export default function mapObject<
  T,
  O,
  K extends PropertyKey
>(
  obj: Partial<Record<K, T>>,
  fn: (v: T, k: K, obj: Partial<Record<K, T>>) => O
): Partial<Record<K, O>> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, fn(v as T, k as K, obj)])
  ) as Partial<Record<K, O>>;
}
