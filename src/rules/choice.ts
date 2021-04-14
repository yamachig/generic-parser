import { BaseEnv, MatchResult, Rule, Empty, UnknownRule, UnknownTarget, ValueOfRule, BasePos, ConvertedRuleOf, convertRuleOrFunc, RuleOrFunc } from "../core";
import { RuleFactory } from "./factory";
import { SequenceRule } from "./sequence";

export class ChoiceRule<
    TTarget extends UnknownTarget,
    TValue,
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
    TRuleFactory extends RuleFactory<TTarget, TPrevEnv>,
> extends Rule<
    TTarget,
    TValue,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "ChoiceRule" as const;

    public constructor(
        public rules: UnknownRule<TTarget>[],
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
        TValue,
        TPrevEnv
    > {
        for (const rule of this.rules) {
            const result = rule.match(pos, target, env);
            if (result.ok) return {
                ok: true,
                nextPos: result.nextPos,
                value: result.value as TValue,
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
        TValue | ValueOfRule<ConvertedRuleOf<TRuleOrFunc, TRuleFactory>>,
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
        immediateFunc: (emptySequence: SequenceRule<TTarget, undefined, TPrevEnv, Empty, "Empty", TRuleFactory>) => TRule,
    ): ChoiceRule<
        TTarget,
        TValue | ValueOfRule<TRule>,
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
            TValue | ValueOfRule<TRule>,
            TPrevEnv,
            TRuleFactory
        >;
    }
}
