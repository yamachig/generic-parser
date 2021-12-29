import { AddEnvOfRule, makeActionEnv, MatchResult, NewEnvOfRule, PrevEnvOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget, AddActionForRule, BaseEnv, BasePos, MatchFail, MatchContext } from "../core";
import { RuleFactory } from "./factory";

const getMaxOffset = (result: MatchFail) => {
    if (Array.isArray(result.prevFail)) {
        const prevMax = Math.max(...result.prevFail.map(getMaxOffset));
        return Math.max(result.offset, prevMax);
    } else if (result.prevFail === null){
        return result.offset;
    } else {
        return Math.max(result.offset, result.prevFail.offset);
    }
};
export class ActionRule<
    TRule extends UnknownRule<UnknownTarget>,
    TValue
> extends Rule<
    TargetOfRule<TRule>,
    TValue,
    PrevEnvOfRule<TRule>,
    AddEnvOfRule<TRule>
> {
    public readonly classSignature = "ActionRule" as const;

    constructor(
        rule: TRule,
        thenFunc: (
            env: AddActionForRule<TRule>
        ) => TValue,
        name?: string | null,
    )
    constructor(
        rule: TRule,
        thenFunc: (
            env: AddActionForRule<TRule>
        ) => TValue,
        catchFunc: (
            env: AddActionForRule<TRule> & {
                result: MatchFail,
                prevEnv: PrevEnvOfRule<TRule>,
                factory: RuleFactory<TargetOfRule<TRule>, PrevEnvOfRule<TRule>>,
            }
        ) => MatchResult<
            TValue,
            NewEnvOfRule<TRule>
        >,
        name?: string | null,
    )
    public constructor(
        public rule: TRule,
        public thenFunc: (
            env: AddActionForRule<TRule>
        ) => TValue,
        catchFuncOrName: (
            | (
                (
                    env: AddActionForRule<TRule> & {
                        result: MatchFail,
                        prevEnv: PrevEnvOfRule<TRule>,
                        factory: RuleFactory<TargetOfRule<TRule>, PrevEnvOfRule<TRule>>,
                    }
                ) => MatchResult<
                    TValue,
                    NewEnvOfRule<TRule>
                >
            )
            | string
            | null
        ) = null,
        name: string | null = null,
    ) {
        super(typeof catchFuncOrName === "function" ? name : catchFuncOrName);
        if (typeof catchFuncOrName === "function") {
            this.catchFunc = catchFuncOrName;
        }
    }

    public catchFunc: (
        | (
            (
                env: AddActionForRule<TRule> & {
                    result: MatchFail,
                    prevEnv: PrevEnvOfRule<TRule>,
                    factory: RuleFactory<TargetOfRule<TRule>, PrevEnvOfRule<TRule>>,
                }
            ) => MatchResult<
                TValue,
                NewEnvOfRule<TRule>
            >
        )
        | null
    ) = null;

    protected __match__(
        offset: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
        context: MatchContext,
    ): MatchResult<
        TValue,
        NewEnvOfRule<TRule>
    > {
        const result = this.rule.match(offset, target, env, context);

        if (result.ok) {
            const newEnv = result.env;
            const value = this.thenFunc(
                makeActionEnv(
                    offset,
                    result.nextOffset,
                    target,
                    newEnv,
                ) as unknown as AddActionForRule<TRule>
            );
            return {
                ok: true,
                nextOffset: result.nextOffset,
                value,
                env: newEnv as NewEnvOfRule<TRule>,
            };
        } else if (typeof this.catchFunc === "function") {
            const newEnv = {
                ...(env as BaseEnv<UnknownTarget, BasePos>),
                result,
                prevEnv: env,
                factory: new RuleFactory<TargetOfRule<TRule>, PrevEnvOfRule<TRule>>(),
            };
            return this.catchFunc(
                makeActionEnv(
                    offset,
                    getMaxOffset(result),
                    target,
                    newEnv,
                ) as unknown as AddActionForRule<TRule> & {
                    result: MatchFail,
                    prevEnv: PrevEnvOfRule<TRule>,
                    factory: RuleFactory<TargetOfRule<TRule>, PrevEnvOfRule<TRule>>,
                }
            );
        } else {
            return {
                ok: false,
                offset,
                expected: this.toString(env.toStringOptions),
                prevFail: result,
            };
        }

    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `(${this.rule.toString(options, currentDepth + 1)}){<action>}`;
    }
}
