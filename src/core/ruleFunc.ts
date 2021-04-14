import { UnknownRule } from "./rule";
import { UnknownTarget } from "./target";

export type RuleFunc<
    TRule extends UnknownRule<UnknownTarget>,
    TFactory,
> = (factory: TFactory) => TRule;

export type RuleOrFunc<
    TRule extends UnknownRule<UnknownTarget>,
    TFactory,
> = TRule | RuleFunc<TRule, TFactory>;

export type OrigRuleOf<
    TRuleOrFunc extends RuleOrFunc<UnknownRule<UnknownTarget>, TFactory>,
    TFactory
> =
    TRuleOrFunc extends RuleOrFunc<infer TRule, TFactory>
        ? TRule
        : never;

