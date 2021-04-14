import { ActionEnv, BaseEnv, BasePos, Empty, PosOf } from "./env";
import { MatchResult } from "./result";
import { ItemOf, UnknownTarget } from "./target";


export type AddActionForRule<TRule extends UnknownRule<UnknownTarget>> =
    ActionEnv<TargetOfRule<TRule>, PosOf<NewEnvOfRule<TRule>>> & NewEnvOfRule<TRule>;


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
