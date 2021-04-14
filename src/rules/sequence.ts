import { RuleFactory } from "./factory";
import { BaseEnv, MatchResult, Rule, Empty, UnknownRule, ValueOfRule, UnknownTarget, BasePos, AddActionForRule, OrigRuleOf, RuleOrFunc, ConvertedRuleOf, convertRuleOrFunc } from "../core";
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

export class SequenceRule<
    TTarget extends UnknownTarget,
    TRuleStructs extends UnknownRuleStruct<TTarget>[],
    TValues extends unknown,
    TOrigPrevEnv extends BaseEnv<TTarget, BasePos>,
    TCurrentAddEnv extends Empty,
    TStatus extends SequenceRuleValueStatus,
    TRuleFactory extends RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv>,
> extends Rule<
    TTarget,
    TValues,
    TOrigPrevEnv,
    TCurrentAddEnv
> {
    public readonly classSignature = "SequenceRule" as const;

    public constructor(
        public rules: TRuleStructs,
        public factory: TRuleFactory,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TTarget,
        env: TOrigPrevEnv,
    ): MatchResult<
        TValues,
        TOrigPrevEnv & TCurrentAddEnv
    > {

        const value: unknown[] = [];

        let nextPos = pos;
        let nextEnv = env as BaseEnv<UnknownTarget, BasePos> & Record<string, unknown>;

        for (const { label, rule, omit } of this.rules) {
            const result = rule.match(nextPos, target, nextEnv);
            if (!result.ok) return result;
            nextPos = result.nextPos;
            nextEnv = { ...result.env };
            if (typeof label === "string") {
                nextEnv[label] = result.value;
            }
            if (!omit) value.push(result.value);
        }

        return {
            ok: true as const,
            nextPos,
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

    public toString(): string { return this.name ?? "<sequence of rules>"; }

    public and<
        TRuleOrFunc extends RuleOrFunc<Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>, TRuleFactory>,
        TLabel extends string | null = null,
        TOmit extends boolean = false,
    >(
        ruleOrFunc: TRuleOrFunc,
        label: TLabel = null as TLabel,
        omit: TOmit = false as TOmit,
    ): SequenceRule<
        TTarget,
        [...TRuleStructs, RuleStruct<ConvertedRuleOf<TRuleOrFunc, TRuleFactory>, TLabel, TOmit>],
        TOmit extends true
            ? TValues
            : TStatus extends "Empty"
                ? ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>
                : TStatus extends "Single"
                    ? [TValues, ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>]
                    : TValues extends unknown[]
                        ? [...TValues, ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>]
                        : never,
        TOrigPrevEnv,
        TCurrentAddEnv & AddEnvOfName<ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>, TLabel>,
        TOmit extends true
            ? TStatus
            : TStatus extends "Empty" ? "Single" : "Multiple",
        Omit<TRuleFactory, keyof RuleFactory<TTarget, BaseEnv<TTarget, BasePos>>> & RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv & AddEnvOfName<ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>, TLabel>>
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
            this.factory as unknown as Omit<TRuleFactory, keyof RuleFactory<TTarget, BaseEnv<TTarget, BasePos>>> & RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv & AddEnvOfName<ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>, TLabel>>,
            this.name,
        );
    }

    public andOmit<
        TRuleOrFunc extends RuleOrFunc<Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>, TRuleFactory>,
        TLabel extends string | null = null,
    >(
        ruleOrFunc: TRuleOrFunc,
        label: TLabel = null as TLabel,
    ): SequenceRule<
        TTarget,
        [...TRuleStructs, RuleStruct<ConvertedRuleOf<TRuleOrFunc, TRuleFactory>, TLabel, true>],
        TValues,
        TOrigPrevEnv,
        TCurrentAddEnv & AddEnvOfName<ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>, TLabel>,
        TStatus,
        Omit<TRuleFactory, keyof RuleFactory<TTarget, BaseEnv<TTarget, BasePos>>> & RuleFactory<TTarget, TOrigPrevEnv & TCurrentAddEnv & AddEnvOfName<ValueOfRule<OrigRuleOf<TRuleOrFunc, TRuleFactory>>, TLabel>>
    > {
        return this.and(
            ruleOrFunc,
            label,
            true,
        );
    }

    public action<
        TValue,
    >(
        func: (env: AddActionForRule<this>) => TValue,
    ):
        ActionRule<
            this,
            TValue
        >
    {
        return new ActionRule(
            this,
            func,
        );
    }
}
