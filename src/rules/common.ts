export interface MatchSuccess<
    TValue,
    TEnv extends BaseEnv<UnknownTarget, BasePos>,
> {
    ok: true,
    nextPos: number,
    value: TValue,
    env: TEnv,
}

export interface MatchFail {
    ok: false,
    pos: number,
    expected: string,
}

export type MatchResult<
    TValue,
    TEnv extends BaseEnv<UnknownTarget, BasePos>,
> = MatchSuccess<TValue, TEnv> | MatchFail;

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

export type AddActionForRule<TRule extends UnknownRule<UnknownTarget>> =
    ActionEnv<TargetOfRule<TRule>, PosOf<NewEnvOfRule<TRule>>> & NewEnvOfRule<TRule>;

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

export abstract class Rule<
    TTarget extends UnknownTarget,
    TValue,
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
    TAddEnv extends Empty,
> {
    public constructor(
        public name: string | null,
    ){}

    public abstract match(
        pos: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<TValue, TPrevEnv & TAddEnv>;

    public abstract toString(): string;

    public abstract(): Rule<TTarget, TValue, BaseEnv<TTarget, BasePos>, Empty> {
        return this as Rule<TTarget, TValue, BaseEnv<TTarget, BasePos>, Empty>;
    }
}

export type UnknownRule<TTarget extends UnknownTarget> = Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>;

export type UnknownTarget = ArrayLike<unknown>;

export type ValueRule<TTarget extends UnknownTarget, TValue> = Rule<TTarget, TValue, BaseEnv<TTarget, BasePos>, Empty>;

export type ItemOfRule<TRule extends UnknownRule<UnknownTarget>> =
    TRule extends Rule<infer TTarget, unknown, BaseEnv<infer TTarget, BasePos>, Empty>
        ? ItemOf<TTarget>
        : never;

export type TargetOfRule<TRule extends UnknownRule<UnknownTarget>> =
    TRule extends Rule<infer TTarget, unknown, BaseEnv<infer TTarget, BasePos>, Empty>
        ? TTarget
        : never

export type ValueOfRule<TRule extends UnknownRule<UnknownTarget>> =
    TRule extends Rule<UnknownTarget, infer TValue, BaseEnv<UnknownTarget, BasePos>, Empty>
        ? TValue
        : never

export type PrevEnvOfRule<TRule extends UnknownRule<UnknownTarget>> =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TRule extends Rule<UnknownTarget, unknown, infer TPrevEnv, infer _TAddEnv>
        ? TPrevEnv
        : never

export type AddEnvOfRule<TRule extends UnknownRule<UnknownTarget>> =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TRule extends Rule<UnknownTarget, unknown, BaseEnv<UnknownTarget, BasePos>, infer TAddEnv>
        ? Omit<TAddEnv, keyof PrevEnvOfRule<TRule>>
        : never

export type NewEnvOfRule<TRule extends UnknownRule<UnknownTarget>> =
    PrevEnvOfRule<TRule> & AddEnvOfRule<TRule>

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

export type Empty = Record<never, never>;
