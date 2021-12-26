import { BaseEnv, BasePos, Location } from "./env";
import { UnknownTarget } from "./target";

export interface MatchSuccess<
    TValue,
    TEnv extends BaseEnv<UnknownTarget, BasePos>,
> {
    ok: true,
    nextOffset: number,
    value: TValue,
    env: TEnv,
}

export interface MatchFail {
    ok: false,
    offset: number,
    expected: string,
    prevFail: MatchFail | MatchFail[] | null,
    stack: string,
}

export const getStackByThrow = (): string => {
    try {
        throw new Error();
    } catch (e) {
        return (e as Error).stack ?? "";
    }
};

export type MatchResult<
    TValue,
    TEnv extends BaseEnv<UnknownTarget, BasePos>,
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
