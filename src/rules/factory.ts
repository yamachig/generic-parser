import { AssertRule } from "./assert";
import { AssertNotRule } from "./assertNot";
import { BaseEnv, UnknownRule, UnknownTarget, ItemOf, WithIncludes, SliceOf, Empty, Rule, BasePos, AddActionForRule, ActionEnv, PosOf } from "./common";
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
import { RuleOrFunc } from "./ruleFunc";
import { convertRuleOrFunc } from "./lazyRule";
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
        ActionRule<
            TRule,
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
        AnyOneRule<TTarget, TPrevEnv>
    {
        return new AnyOneRule(
            this.name,
        );
    }

    public assert(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => boolean,
    ):
        AssertRule<TTarget, TPrevEnv>
    {
        return new AssertRule(
            func,
            this.name,
        );
    }

    public assertNot(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => boolean,
    ):
        AssertNotRule<TTarget, TPrevEnv>
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
        AsSliceRule<
            TSlice,
            TRule
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
        immediateFunc: (emptySequence: ChoiceRule<TTarget, [], TPrevEnv, this>) => TRule,
    ):
        TRule
    {
        return immediateFunc(
            new ChoiceRule(
                [],
                this,
                this.name
            ),
        );
    }

    public nextIs<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        NextIsRule<
            TRule
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
        NextIsNotRule<
            TRule
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
        OneOfRule<
            TItem,
            TTarget & ArrayLike<TItem>,
            TPrevEnv
        >
    {
        return new OneOfRule(
            items,
            this.name,
        );
    }

    public oneOrMore<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        OneOrMoreRule<
            TRule
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
        RefRule<
            TRule
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
        SeqEqualRule<TTarget & ArrayLike<ItemOf<TValue>>, TValue, TPrevEnv>
    {
        return new SeqEqualRule(
            sequence,
            this.name,
        );
    }

    public sequence<
        TRule extends UnknownRule<TTarget>,
    >(
        immediateFunc: (emptySequence: SequenceRule<TTarget, [], undefined, TPrevEnv, Empty, "Empty", this>) => TRule,
    ):
        TRule
    {
        return immediateFunc(
            new SequenceRule(
                [],
                this,
                this.name,
            ),
        );
    }

    public zeroOrMore<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        ZeroOrMoreRule<
            TRule
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
        ZeroOrOneRule<
            TRule
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
