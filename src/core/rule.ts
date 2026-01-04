import { ActionEnv, BaseEnv, BasePos, Empty, PosOf } from "./env";
import { MatchResult } from "./result";
import { ItemOf, UnknownTarget } from "./target";


export type AddActionForRule<TRule extends UnknownRule<UnknownTarget>> =
    Omit<ActionEnv<TargetOfRule<TRule>, PosOf<NewEnvOfRule<TRule>>>, keyof NewEnvOfRule<TRule>> & NewEnvOfRule<TRule>;

export interface MatchContext {
    prevRule: UnknownRule<UnknownTarget>;
    offset: number,
    prevContext: MatchContext | null,
}

export abstract class Rule<
    TTarget extends UnknownTarget,
    TValue,
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
    TAddEnv extends Empty,
> {
    public constructor(
        public name: string | null,
    ){}

    public match(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
        prevContext: MatchContext | null = null,
    ): MatchResult<TValue, TPrevEnv & TAddEnv> {
        const context = {
            prevRule: this,
            offset,
            prevContext,
        };
        const result = this.__match__(
            offset,
            target,
            env,
            context,
        );
        if (!result.ok && env.onMatchFail) {
            env.onMatchFail(result, context);
        }
        return result;
    }

    protected abstract __match__(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
        context: MatchContext,
    ): MatchResult<TValue, TPrevEnv & TAddEnv>;

    public abstract toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth?: number): string;

    public abstract(): Rule<TTarget, TValue, TPrevEnv, Empty> {
        return this as Rule<TTarget, TValue, TPrevEnv, Empty>;
    }
}

export type UnknownRule<TTarget extends UnknownTarget> = Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>;

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
    TRule extends Rule<UnknownTarget, unknown, BaseEnv<UnknownTarget, BasePos>, infer TAddEnv>
        ? Omit<TAddEnv, keyof PrevEnvOfRule<TRule>>
        : never

export type NewEnvOfRule<TRule extends UnknownRule<UnknownTarget>> =
    PrevEnvOfRule<TRule> & AddEnvOfRule<TRule>
