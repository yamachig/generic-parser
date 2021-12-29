import { BaseEnv, MatchResult, Rule, Empty, UnknownRule, UnknownTarget, ValueOfRule, BasePos, ConvertedRuleOf, convertRuleOrFunc, RuleOrFunc, MatchFail, MatchContext } from "../core";
import { RuleFactory } from "./factory";
import { SequenceRule } from "./sequence";

export class ChoiceRule<
    TTarget extends UnknownTarget,
    TValue,
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
> extends Rule<
    TTarget,
    TValue,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "ChoiceRule" as const;

    public constructor(
        public rules: UnknownRule<TTarget>[],
        public factory: RuleFactory<TTarget, TPrevEnv>,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
        context: MatchContext,
    ): MatchResult<
        TValue,
        TPrevEnv
    > {
        const prevFail: MatchFail[] = [];
        for (const rule of this.rules) {
            const result = rule.match(offset, target, env, context);
            if (result.ok) {
                return {
                    ok: true,
                    nextOffset: result.nextOffset,
                    value: result.value as TValue,
                    env,
                };
            } else {
                prevFail.push(result);
            }
        }

        return {
            ok: false,
            offset,
            expected: this.toString(env.toStringOptions),
            prevFail,
        };
    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? (options?.fullToString ? `${this.rules.map(rule => rule.toString(options, currentDepth + 1)).join(" / ")}` : "<choice of rules>");
    }

    public or<
        TRuleOrFunc extends RuleOrFunc<Rule<TTarget, unknown, BaseEnv<TTarget, BasePos>, Empty>, RuleFactory<TTarget, TPrevEnv>>,
    >(
        ruleOrFunc: TRuleOrFunc,
    ): ChoiceRule<
        TTarget,
        TValue | ValueOfRule<ConvertedRuleOf<TRuleOrFunc, RuleFactory<TTarget, TPrevEnv>>>,
        TPrevEnv
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
        immediateFunc: (emptySequence: SequenceRule<TTarget, undefined, TPrevEnv, Empty, "Empty">) => TRule,
    ): ChoiceRule<
        TTarget,
        TValue | ValueOfRule<TRule>,
        TPrevEnv
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
            TPrevEnv
        >;
    }
}
