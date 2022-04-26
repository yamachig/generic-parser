import { BasePos, Location } from "./env";
import { UnknownRule } from "./rule";
import { UnknownTarget } from "./target";

export interface MatchSuccess<
    TValue,
    TEnv,
> {
    ok: true,
    nextOffset: number,
    value: TValue,
    env: TEnv,
}

export interface MatchSuccessJson {
    ok: true,
    nextOffset: number,
    value: unknown,
}

export interface MatchFail {
    ok: false,
    offset: number,
    expected: UnknownRule<UnknownTarget>,
    prevFail: MatchFail | MatchFail[] | null,
}

export interface MatchFailJson {
    ok: false,
    offset: number,
    expected: string,
    prevFail: MatchFailJson | MatchFailJson[] | null,
}

export const matchResultToJson = <TValue, TEnv>(
    matchResult: MatchResult<TValue, TEnv>,
    toStringOptions?: {fullToString?: boolean, maxToStringDepth?: number}
): MatchSuccessJson | MatchFailJson => {
    if (matchResult.ok) {
        return {
            ok: true,
            nextOffset: matchResult.nextOffset,
            value: matchResult.value,
        };
    } else {
        const { offset, expected, prevFail } = matchResult;
        return {
            ok: false,
            offset,
            expected: expected.toString(toStringOptions),
            prevFail: (
                (Array.isArray(prevFail)
                    ? prevFail.map(f => matchResultToJson(f, toStringOptions)) as MatchFailJson[]
                    : prevFail
                        ? matchResultToJson(prevFail, toStringOptions) as MatchFailJson
                        : null
                )
            ),
        };
    }
};

export const getStackByThrow = (): string => {
    try {
        throw new Error();
    } catch (e) {
        return (e as Error).stack ?? "";
    }
};

export type MatchResult<
    TValue,
    TEnv,
> = MatchSuccess<TValue, TEnv> | MatchFail;


export class ParseError<
    TPos extends BasePos
> extends Error {
    public constructor(
        message: string,
        public location: Location<TPos>,
    ) {
        super(message);
    }
}
