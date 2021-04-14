export type UnknownTarget = ArrayLike<unknown>;

export interface Sliceable<TSlice> {
    slice(start?: number | undefined, end?: number | undefined): TSlice,
}
export interface WithIncludes<TItem> {
    includes(item: TItem): boolean,
}

export type SliceOf<TSliceableArrayLike> =
    TSliceableArrayLike extends Sliceable<infer TItem>
        ? TItem
        : never;

export type ItemOf<TArrayLike> =
    TArrayLike extends ArrayLike<infer TItem>
        ? TItem
        : never;
