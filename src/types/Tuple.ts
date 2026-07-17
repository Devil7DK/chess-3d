export type Tuple<T, N extends number, A extends unknown[] = []> = A extends {
    length: N;
}
    ? A
    : Tuple<T, N, [...A, T]>;
