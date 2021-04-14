import { AssertRule } from "./assert";
import { AssertNotRule } from "./assertNot";
import { BaseEnv, UnknownRule, UnknownTarget, ItemOf, WithIncludes, SliceOf, Empty, Rule, BasePos, AddActionForRule, ActionEnv, PosOf, RuleOrFunc, convertRuleOrFunc, ValueRule, ValueOfRule, AddEnvOfRule, PrevEnvOfRule } from "../core";
import { NextIsRule } from "./nextIs";
import { NextIsNotRule } from "./nextIsNot";
import { OneOfRule } from "./oneOf";
import { OneOrMoreRule } from "./oneOrMore";
import { ActionRule } from "./action";
import { SeqEqualRule } from "./seqEqual";
import { SequenceRule } from "./sequence";
import { ZeroOrMoreRule } from "./zeroOrMore";
import { ZeroOrOneRule } from "./zeroOrOne";
import { RefRule } from "./ref";
import { AnyOneRule } from "./anyOne";
import { AsSliceRule } from "./asSlice";
import { ChoiceRule } from "./choice";
export class RuleFactory<
    TTarget extends UnknownTarget,
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
> {
    public constructor(
        public name: string | null = null,
    ) { }

    public withName(name: string): this {
        return new RuleFactory<TTarget, TPrevEnv>(name) as this;
    }

    public action<
        TValue,
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
        func: (env: AddActionForRule<TRule>) => TValue,
    ):
        ValueRule<
            TTarget,
            TValue
        >
    {
        return new ActionRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            func,
            this.name,
        );
    }

    public anyOne(
    ):
        ValueRule<
            TTarget,
            ItemOf<TTarget>
            >
    {
        return new AnyOneRule(
            this.name,
        );
    }

    public assert(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => boolean,
    ):
        ValueRule<
            TTarget,
            undefined
        >
    {
        return new AssertRule(
            func,
            this.name,
        );
    }

    public assertNot(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => boolean,
    ):
        ValueRule<
            TTarget,
            undefined
        >
    {
        return new AssertNotRule(
            func,
            this.name,
        );
    }

    public asSlice<
        TSlice extends SliceOf<TTarget>,
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            TSlice
        >
    {
        return new AsSliceRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }

    public choice<
        TRule extends Rule<TTarget, unknown, TPrevEnv, Empty>,
    >(
        immediateFunc: (emptySequence: ChoiceRule<TTarget, never, TPrevEnv, this>) => TRule,
    ):
        ValueRule<
            TTarget,
            ValueOfRule<TRule>
        >
    {
        return immediateFunc(
            new ChoiceRule(
                [],
                this,
                this.name
            ),
        ) as ValueRule<
            TTarget,
            ValueOfRule<TRule>
        >;
    }

    public nextIs<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            undefined
        >
    {
        return new NextIsRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }

    public nextIsNot<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            undefined
        >
    {
        return new NextIsNotRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }

    public oneOf<
        TItem extends ItemOf<TTarget>
    >(
        items: WithIncludes<TItem>,
    ):
        ValueRule<
            TTarget,
            TItem
        >
    {
        return new OneOfRule(
            items,
            this.name,
        ) as ValueRule<
            TTarget,
            TItem
        >;
    }

    public oneOrMore<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            ValueOfRule<TRule>[]
        >
    {
        return new OneOrMoreRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }

    public ref<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            ValueOfRule<TRule>
        >
    {
        return new RefRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }

    public seqEqual<
        TValue extends ArrayLike<ItemOf<TTarget>>,
    >(
        sequence: TValue,
    ):
        ValueRule<
            TTarget,
            TValue
        >
    {
        return new SeqEqualRule(
            sequence,
            this.name,
        ) as ValueRule<
            TTarget,
            TValue
        >;
    }

    public sequence<
        TRule extends UnknownRule<TTarget>,
    >(
        immediateFunc: (emptySequence: SequenceRule<TTarget, undefined, TPrevEnv, Empty, "Empty", this>) => TRule,
    ):
        Rule<
            TTarget,
            ValueOfRule<TRule>,
            PrevEnvOfRule<TRule>,
            AddEnvOfRule<TRule>
        >
    {
        return immediateFunc(
            new SequenceRule(
                [],
                this,
                this.name,
            ),
        ) as unknown as Rule<
            TTarget,
            ValueOfRule<TRule>,
            PrevEnvOfRule<TRule>,
            AddEnvOfRule<TRule>
        >;
    }

    public zeroOrMore<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            ValueOfRule<TRule>[]
        >
    {
        return new ZeroOrMoreRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }

    public zeroOrOne<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ValueRule<
            TTarget,
            ValueOfRule<TRule> | null
        >
    {
        return new ZeroOrOneRule(
            convertRuleOrFunc(
                ruleOrFunc,
                this,
            ) as TRule,
            this.name,
        );
    }
}
