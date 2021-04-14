import { MatchResult } from "./result";
import { AddEnvOfRule, NewEnvOfRule, PrevEnvOfRule, Rule, TargetOfRule, UnknownRule, ValueOfRule } from "./rule";
import { RuleFunc, RuleOrFunc } from "./ruleFunc";
import { UnknownTarget } from "./target";

export type ConvertedRuleOf<
    TRuleOrFunc extends RuleOrFunc<UnknownRule<UnknownTarget>, TFactory>,
    TFactory
> =
    TRuleOrFunc extends UnknownRule<UnknownTarget>
        ? TRuleOrFunc
        : TRuleOrFunc extends RuleFunc<infer TRule, infer TFactory>
            ? LazyRule<TRule, TFactory>
            : never;

export const convertRuleOrFunc = <
    TRuleOrFunc extends RuleOrFunc<UnknownRule<UnknownTarget>, TFactory>,
    TFactory,
>(
        ruleOrFunc: TRuleOrFunc,
        factory: TFactory,
    ): ConvertedRuleOf<TRuleOrFunc, TFactory> => {
    const rule = (
        typeof ruleOrFunc === "function"
            ? new LazyRule(
                ruleOrFunc,
                factory,
            )
            : ruleOrFunc
    );
    return rule as ConvertedRuleOf<TRuleOrFunc, TFactory>;
};

export class LazyRule<
    TRule extends UnknownRule<UnknownTarget>,
    TFactory,
> extends Rule<
    TargetOfRule<TRule>,
    ValueOfRule<TRule>,
    PrevEnvOfRule<TRule>,
    AddEnvOfRule<TRule>
> {
    private _rule: TRule | null = null;
    private func: RuleFunc<TRule, TFactory>;

    public constructor(
        ruleOrFunc: RuleOrFunc<TRule, TFactory>,
        public factory: TFactory,
        name: string | null = null,
    ) {
        super(name);
        if (typeof ruleOrFunc === "function") {
            this.func = ruleOrFunc;
        } else {
            this.func = () => ruleOrFunc;
            this._rule = ruleOrFunc;
        }
    }

    public match(
        pos: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        ValueOfRule<TRule>,
        NewEnvOfRule<TRule>
    > {
        if (this._rule === null) {
            this._rule = this.func(this.factory);
        }
        return this._rule.match(pos, target, env) as MatchResult<
            ValueOfRule<TRule>,
            NewEnvOfRule<TRule>
        >;
    }

    public toString(): string {
        if (this.name !== null) return this.name;
        if (this._rule === null) {
            this._rule = this.func(this.factory);
        }
        return this._rule.toString();
    }
}
