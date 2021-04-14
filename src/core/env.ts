import { ParseError } from "./result";
import { Sliceable, SliceOf, UnknownTarget } from "./target";

export type Empty = Record<never, never>;

export interface BasePos {
    offset: number; // 0-based
}

export interface Location<TPos extends BasePos> {
    start: TPos,
    end: TPos, // open-ended
}

export interface BaseEnv<
    TTarget extends UnknownTarget,
    TPos extends BasePos,
> {
    offsetToPos(target: TTarget, offset: number): TPos;
}

export const arrayLikeOffsetToPos =
    (_target: UnknownTarget, offset: number): BasePos => {
        return {
            offset,
        };
    };

export type PosOf<T> =
    T extends BaseEnv<UnknownTarget, infer TPos>
        ? TPos
        : never;

export interface ActionEnv<
    TTarget extends UnknownTarget,
    TPos extends BasePos
> {
    error(message: string, where?: Location<TPos>): never;
    expected(expected: string, where?: Location<TPos>): never;
    location(): Location<TPos>;
    offset(): number;
    range(): [start: number, end: number];
    text(): SliceOf<TTarget>;
}

export const makeActionEnv = <
    TTarget extends UnknownTarget,
    TEnv extends BaseEnv<TTarget, TPos>,
    TPos extends BasePos = PosOf<TEnv>
> (
        start: number,
        end: number,
        target: TTarget,
        env: TEnv,
    ):
    ActionEnv<TTarget, TPos> & TEnv =>
{
    const error = (
        message: string,
        where: Location<TPos>,
    ): never => {
        throw new ParseError<TPos>(message, where);
    };

    const expected = (
        expected: string,
        where: Location<TPos> = location(),
    ): never => {
        throw new ParseError<TPos>(
            `Expected ${expected} but "${text()}" found`,
            where,
        );
    };

    const location = (): Location<TPos> => {
        return {
            start: env.offsetToPos(target, start),
            end: env.offsetToPos(target, end),
        };
    };

    const offset = (): number => {
        return start;
    };

    const range = (): [start: number, end: number] => {
        return [
            start,
            end,
        ];
    };

    const text = (): SliceOf<TTarget> => {
        return (target as unknown as Sliceable<unknown>)
            .slice(start, end) as SliceOf<TTarget>;
    };

    return {
        ...env,
        error,
        expected,
        location,
        offset,
        range,
        text,
    };
};
