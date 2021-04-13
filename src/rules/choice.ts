import { BaseEnv, MatchResult, Rule, Empty, UnknownRule, UnknownTarget, ValueOfRule, BasePos } from "./common";
import { RuleFactory } from "./factory";
import { ConvertedRuleOf, convertRuleOrFunc } from "./lazyRule";
import { RuleOrFunc } from "./ruleFunc";
import { SequenceRule } from "./sequence";

export class ChoiceRule<
    TTarget extends UnknownTarget,
    TRules extends UnknownRule<TTarget>[],
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
    TRuleFactory extends RuleFactory<TTarget, TPrevEnv>,
> extends Rule<
    TTarget,
    ValueOfRule<TRules[(keyof TRules) & number]>,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "ChoiceRule" as const;

    public constructor(
        public rules: TRules,
        public factory: TRuleFactory,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        ValueOfRule<TRules[(keyof TRules) & number]>,
        TPrevEnv
    > {
        for (const rule of this.rules) {
            const result = rule.match(pos, target, env);
            if (result.ok) return {
                ok: true,
                nextPos: result.nextPos,
                value: result.value as ValueOfRule<TRules[(keyof TRules) & number]>,
                env,
            };
        }

        return {
            ok: false,
            pos,
            expected: this.toString(),
        };
    }

    public toString(): string { return this.name ?? "<choice of rules>"; }

    public or<
        TRuleOrFunc extends RuleOrFunc<Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>, TRuleFactory>,
    >(
        ruleOrFunc: TRuleOrFunc,
    ): ChoiceRule<
        TTarget,
        [...TRules, ConvertedRuleOf<TRuleOrFunc, TRuleFactory>],
        TPrevEnv,
        TRuleFactory
    > {
        return new ChoiceRule(
            [
                ...this.rules,
                convertRuleOrFunc(
                    ruleOrFunc,
                    this.factory,
                ),
            ],
            this.factory,
            this.name,
        );
    }

    public orSequence<
        TRule extends UnknownRule<TTarget>,
    >(
        immediateFunc: (emptySequence: SequenceRule<TTarget, [], undefined, TPrevEnv, Empty, "Empty", TRuleFactory>) => TRule,
    ): ChoiceRule<
        TTarget,
        [...TRules, TRule],
        TPrevEnv,
        TRuleFactory
    >
    {
        const rule = immediateFunc(
            new SequenceRule(
                [],
                this.factory,
                null,
            ),
        );
        return this.or(rule) as unknown as ChoiceRule<
            TTarget,
            [...TRules, TRule],
            TPrevEnv,
            TRuleFactory
        >;
    }
}
