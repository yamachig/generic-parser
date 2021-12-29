import { BasePos, Location } from "./env";

export interface MatchSuccess<
    TValue,
    TEnv,
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
