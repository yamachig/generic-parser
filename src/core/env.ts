import { MatchContext, MatchFail } from ".";
import { ParseError } from "./result";
import { Sliceable, SliceOf, UnknownTarget } from "./target";

export type Empty = Record<never, never>;

export interface BasePos {
    offset: number; // 0-based
}

export interface StringPos extends BasePos {
    line: number; // 1-based
    column: number; // 1-based
}

export interface Location<TPos extends BasePos> {
    start: TPos,
    end: TPos, // open-ended
}

export interface BaseEnv<
    TTarget extends UnknownTarget,
    TPos extends BasePos,
> {

    options: Record<string | number | symbol, unknown>;

    registerCurrentRangeTarget(rawStart: number, rawEnd: number, target: TTarget): void;
    offsetToPos(target: TTarget, rawOffset: number): TPos;

    onMatchFail?: (matchFail: MatchFail, matchContext: MatchContext) => void;

    baseOffset: number;

}

export const arrayLikeOffsetToPos =
    (_target: UnknownTarget, offset: number): BasePos => {
        return {
            offset,
        };
    };

export const getLineOffsets = (target: string): number[] => {
    const lineOffsets: number[] = [0];
    for (const m of target.matchAll(/\r\n|\r|\n/g)) {
        lineOffsets.push((m.index ?? 0) + m[0].length);
    }
    return lineOffsets;
};

export const getMemorizedStringOffsetToPos = () => {
    // return (target: string, offset: number): StringPos => {
    //     const beforeStr = target.slice(0, offset);
    //     const lines = beforeStr.split(/\r?\n/g);
    //     return {
    //         offset,
    //         line: lines.length,
    //         column: lines[lines.length - 1].length + 1,
    //     };
    // };
    const lineOffsetsMemo = new Map<string, number[]>();
    return (target: string, offset: number): StringPos => {
        const lineOffsets = lineOffsetsMemo.get(target) ?? getLineOffsets(target);
        if (!lineOffsetsMemo.has(target)) {
            lineOffsetsMemo.set(target, lineOffsets);
        }
        let low = 0;
        let high = lineOffsets.length - 1;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const [currentOffset, nextOffset] = [
                lineOffsets[mid],
                (mid + 1 < lineOffsets.length) ? lineOffsets[mid + 1] : Infinity,
            ];
            if (currentOffset <= offset && offset < nextOffset) {
                low = high = mid;
            } else if (offset < currentOffset) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return {
            offset,
            line: low + 1,
            column: offset - lineOffsets[low] + 1,
        };
    };
};

export type TargetOf<T> =
    T extends BaseEnv<infer TTarget, BasePos>
        ? TTarget
        : never;

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
    target(): TTarget;
}

export const makeActionEnv = <
    TTarget extends UnknownTarget,
    TEnv extends BaseEnv<TTarget, TPos>,
    TPos extends BasePos = PosOf<TEnv>
> (
        rawStart: number,
        rawEnd: number,
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
            start: env.offsetToPos(target, rawStart),
            end: env.offsetToPos(target, rawEnd),
        };
    };

    const offset = (): number => {
        return rawStart + env.baseOffset;
    };

    const range = (): [start: number, end: number] => {
        return [
            rawStart + env.baseOffset,
            rawEnd + env.baseOffset,
        ];
    };

    const text = (): SliceOf<TTarget> => {
        return (target as unknown as Sliceable<unknown>)
            .slice(rawStart, rawEnd) as SliceOf<TTarget>;
    };

    const _target = (): TTarget => {
        return target;
    };

    env.registerCurrentRangeTarget(rawStart, rawEnd, target);

    return {
        error,
        expected,
        location,
        offset,
        range,
        text,
        target: _target,
        ...env,
    };
};
