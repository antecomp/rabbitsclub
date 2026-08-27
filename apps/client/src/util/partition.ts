/**
 * Splits an array into two groups based on whether each item matches the predicate.
 *
 * @param array The array to partition.
 * @param predicate A function that determines whether an item belongs in the first group.
 * @returns A tuple of `[matchingItems, nonMatchingItems]`.
 */
export default function partition<T> (array: T[], predicate: (cur: T) => boolean) {
    return array.reduce<[T[], T[]]>(
        ([pass, fail], cur) =>
            predicate(cur) ? [[...pass, cur], fail] : [pass, [...fail, cur]],
        [[], []]
    );
}