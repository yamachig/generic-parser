import { RuleFactory } from "./factory";
import { BaseEnv, MatchResult, Rule, Empty, UnknownRule, ValueOfRule, UnknownTarget, BasePos, AddActionForRule, OrigRuleOf, RuleOrFunc, convertRuleOrFunc, MatchFail, PrevEnvOfRule, NewEnvOfRule, TargetOfRule, MatchContext } from "../core";
import { ActionRule } from "./action";

export interface RuleStruct<
    TRule extends UnknownRule<UnknownTarget>,
    TLabel extends string | null,
    TOmit extends boolean
> {
    rule: TRule,
    label: TLabel,
    omit: TOmit,
}

type UnknownRuleStruct<TTarget extends UnknownTarget> =
    RuleStruct<
        UnknownRule<TTarget>,
        string | null,
        boolean
    >;

type AddEnvOfName<
    TValue,
    TLabel extends string | null,
> =
    TLabel extends string
        ? {[K in TLabel]: TValue}
        : Empty;

// type AddEnvOfRuleStruct<
//     TRule extends UnknownRule<UnknownTarget>,
//     TLabel extends string | null,
// > =
//     AddEnvOfRule<TRule> & AddEnvOfName<ValueOfRule<TRule>, TLabel>

type SequenceRuleValueStatus = "Empty" | "Single" | "Multiple";

type CatchFuncEnv<TRule extends UnknownRule<UnknownTarget>> = AddActionForRule<TRule> & {
    result: MatchFail,
    prevEnv: PrevEnvOfRule<TRule>,
    factory: RuleFactory<TargetOfRule<TRule>, PrevEnvOfRule<TRule>>,
}
export class SequenceRule<
    TTarget extends UnknownTarget,
    TValues,
    TOrigPrevEnv extends BaseEnv<TTarget, BasePos>,
    TCurrentAddEnv extends Empty,
    TStatus extends SequenceRuleValueStatus,
> extends Rule<
    TTarget,
    TValues,
    TOrigPrevEnv,
    TCurrentAddEnv
> {
    public readonly classSignature = "SequenceRule" as const;

    public constructor(
        public rules: UnknownRuleStruct<TTarget>[],
        public factory: RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv>,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TTarget,
        env: TOrigPrevEnv,
        context: MatchContext,
    ): MatchResult<
        TValues,
        TOrigPrevEnv & TCurrentAddEnv
    > {

        const value: unknown[] = [];

        let nextOffset = offset;
        let nextEnv = env as BaseEnv<UnknownTarget, BasePos> & Record<string, unknown>;

        for (const { label, rule, omit } of this.rules) {
            const result = rule.match(nextOffset, target, nextEnv, context);
            if (!result.ok) return {
                ok: false,
                offset,
                expected: this,
                prevFail: result,
            };
            nextOffset = result.nextOffset;
            nextEnv = { ...result.env };
            if (typeof label === "string") {
                nextEnv[label] = result.value;
            }
            if (!omit) value.push(result.value);
        }

        return {
            ok: true as const,
            nextOffset: nextOffset,
            value: (
                value.length === 0
                    ? undefined
                    : value.length === 1
                        ? value[0]
                        : value
            ) as TValues,
            env: nextEnv as TOrigPrevEnv & TCurrentAddEnv,
        };
    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? (options?.fullToString ? `${this.rules.map(rs => rs.rule.toString()).join(" ")}` : "<sequence of rules>");
    }

    public and<
        TRuleOrFunc extends RuleOrFunc<Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>, RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv>>,
        TLabel extends string | null = null,
        TOmit extends boolean = false,
        TValue = ValueOfRule<OrigRuleOf<TRuleOrFunc, RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv>>>,
    >(
        ruleOrFunc: TRuleOrFunc,
        label: TLabel = null as TLabel,
        omit: TOmit = false as TOmit,
    ): SequenceRule<
        TTarget,
        TOmit extends true
            ? TValues
            : TStatus extends "Empty"
                ? TValue
                : TStatus extends "Single"
                    ? [TValues, TValue]
                    : TValues extends unknown[]
                        ? [...TValues, TValue]
                        : never,
        TOrigPrevEnv,
        TCurrentAddEnv & AddEnvOfName<TValue, TLabel>,
        TOmit extends true
            ? TStatus
            : TStatus extends "Empty" ? "Single" : "Multiple"
    > {
        return new SequenceRule(
            [
                ...this.rules,
                {
                    rule: convertRuleOrFunc(
                        ruleOrFunc,
                        this.factory,
                    ),
                    label,
                    omit,
                }
            ],
            this.factory as RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv & AddEnvOfName<TValue, TLabel>>,
            this.name,
        ) as SequenceRule<
            TTarget,
            TOmit extends true
                ? TValues
                : TStatus extends "Empty"
                    ? TValue
                    : TStatus extends "Single"
                        ? [TValues, TValue]
                        : TValues extends unknown[]
                            ? [...TValues, TValue]
                            : never,
            TOrigPrevEnv,
            TCurrentAddEnv & AddEnvOfName<TValue, TLabel>,
            TOmit extends true
                ? TStatus
                : TStatus extends "Empty" ? "Single" : "Multiple"
        >;
    }

    public andOmit<
        TRuleOrFunc extends RuleOrFunc<Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>, RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv>>,
        TLabel extends string | null = null,
        TValue = ValueOfRule<OrigRuleOf<TRuleOrFunc, RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv>>>,
    >(
        ruleOrFunc: TRuleOrFunc,
        label: TLabel = null as TLabel,
    ): SequenceRule<
        TTarget,
        TValues,
        TOrigPrevEnv,
        TCurrentAddEnv & AddEnvOfName<TValue, TLabel>,
        TStatus
    > {
        return this.and(
            ruleOrFunc,
            label,
            true,
        ) as unknown as SequenceRule<
            TTarget,
            TValues,
            TOrigPrevEnv,
            TCurrentAddEnv & AddEnvOfName<TValue, TLabel>,
            TStatus
        >;
    }

    public action<
        TValue,
    >(
        thenFunc: (env: AddActionForRule<this>) => TValue,
    ):
        ActionRule<
            this,
            TValue
        >
    public action<
        TValue,
    >(
        thenFunc: (env: AddActionForRule<this>) => TValue,
        catchFunc: (
            env: CatchFuncEnv<this>
        ) => MatchResult<
            TValue,
            NewEnvOfRule<this>
        >,
    ):
        ActionRule<
            this,
            TValue
        >
    public action<
        TValue,
    >(
        thenFunc: (env: AddActionForRule<this>) => TValue,
        catchFunc: ((
            env: CatchFuncEnv<this>
        ) => MatchResult<
            TValue,
            NewEnvOfRule<this>
        >) | null = null,
    ):
        ActionRule<
            this,
            TValue
        >
    {
        if (catchFunc) {
            return new ActionRule(
                new SequenceRule(this.rules, this.factory) as this,
                thenFunc,
                catchFunc,
                this.name,
            );
        } else {
            return new ActionRule(
                new SequenceRule(this.rules, this.factory) as this,
                thenFunc,
                this.name,
            );
        }
    }
}
