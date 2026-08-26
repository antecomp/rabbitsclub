export default function partition<T> (array: T[], predicate: (cur: T) => boolean) {
    return array.reduce<[T[], T[]]>(
        ([pass, fail], cur) =>
            predicate(cur) ? [[...pass, cur], fail] : [pass, [...fail, cur]],
        [[], []]
    )
}