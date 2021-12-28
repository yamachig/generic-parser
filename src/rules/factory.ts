import { AssertRule } from "./assert";
import { AssertNotRule } from "./assertNot";
import { BaseEnv, UnknownRule, UnknownTarget, ItemOf, WithIncludes, SliceOf, Empty, Rule, BasePos, AddActionForRule, ActionEnv, PosOf, RuleOrFunc, convertRuleOrFunc, ValueOfRule, AddEnvOfRule, PrevEnvOfRule, MatchFail, MatchResult, NewEnvOfRule } from "../core";
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
import { RegExpRule } from "./regExp";
import { RegExpObjRule } from "./regExpObj";

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
        thenFunc: (env: AddActionForRule<TRule>) => TValue,
    ):
    Rule<
        TTarget,
        TValue,
        TPrevEnv,
        Empty
    >
    public action<
        TValue,
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
        thenFunc: (env: AddActionForRule<TRule>) => TValue,
        catchFunc: (
            env: AddActionForRule<TRule> & {
                result: MatchFail,
                prevEnv: PrevEnvOfRule<TRule>,
                factory: RuleFactory<TTarget, PrevEnvOfRule<TRule>>,
            }
        ) => MatchResult<
            TValue,
            NewEnvOfRule<TRule>
        >,
    ):
    Rule<
        TTarget,
        TValue,
        TPrevEnv,
        Empty
    >
    public action<
        TValue,
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
        thenFunc: (env: AddActionForRule<TRule>) => TValue,
        catchFunc: ((
            env: AddActionForRule<TRule> & {
                result: MatchFail,
                prevEnv: PrevEnvOfRule<TRule>,
                factory: RuleFactory<TTarget, PrevEnvOfRule<TRule>>,
            }
        ) => MatchResult<
            TValue,
            NewEnvOfRule<TRule>
        >) | null = null,
    ):
        Rule<
            TTarget,
            TValue,
            TPrevEnv,
            Empty
        >
    {
        if (catchFunc) {
            return new ActionRule(
                convertRuleOrFunc(
                    ruleOrFunc,
                    new RuleFactory<TTarget, TPrevEnv>() as this,
                ) as TRule,
                thenFunc,
                catchFunc,
                this.name,
            ) as unknown as Rule<
                TTarget,
                TValue,
                TPrevEnv,
                Empty
            >;
        } else {
            return new ActionRule(
                convertRuleOrFunc(
                    ruleOrFunc,
                    new RuleFactory<TTarget, TPrevEnv>() as this,
                ) as TRule,
                thenFunc,
                this.name,
            ) as unknown as Rule<
                TTarget,
                TValue,
                TPrevEnv,
                Empty
            >;
        }
    }

    public anyOne(
    ):
        Rule<
            TTarget,
            ItemOf<TTarget>,
            TPrevEnv,
            Empty
            >
    {
        return new AnyOneRule(
            this.name,
        );
    }

    public assert(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => unknown,
    ):
        Rule<
            TTarget,
            undefined,
            TPrevEnv,
            Empty
        >
    {
        return new AssertRule(
            func,
            this.name,
        );
    }

    public assertNot(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => unknown,
    ):
        Rule<
            TTarget,
            undefined,
            TPrevEnv,
            Empty
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
        Rule<
            TTarget,
            TSlice,
            TPrevEnv,
            Empty
        >
    {
        return new AsSliceRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            TSlice,
            TPrevEnv,
            Empty
        >;
    }

    public choice<
        TRule extends Rule<TTarget, unknown, TPrevEnv, Empty>,
    >(
        immediateFunc: (emptySequence: ChoiceRule<TTarget, never, TPrevEnv>) => TRule,
    ):
        Rule<
            TTarget,
            ValueOfRule<TRule>,
            TPrevEnv,
            Empty
        >
    {
        return immediateFunc(
            new ChoiceRule(
                [],
                new RuleFactory<TTarget, TPrevEnv>() as this,
                this.name
            ),
        ) as Rule<
            TTarget,
            ValueOfRule<TRule>,
            TPrevEnv,
            Empty
        >;
    }

    public nextIs<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        Rule<
            TTarget,
            undefined,
            TPrevEnv,
            Empty
        >
    {
        return new NextIsRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            undefined,
            TPrevEnv,
            Empty
        >;
    }

    public nextIsNot<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        Rule<
            TTarget,
            undefined,
            TPrevEnv,
            Empty
        >
    {
        return new NextIsNotRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            undefined,
            TPrevEnv,
            Empty
        >;
    }

    public oneOf<
        TItem extends ItemOf<TTarget>
    >(
        items: WithIncludes<TItem>,
    ):
        Rule<
            TTarget,
            TItem,
            TPrevEnv,
            Empty
        >
    {
        return new OneOfRule(
            items,
            this.name,
        ) as unknown as Rule<
            TTarget,
            TItem,
            TPrevEnv,
            Empty
        >;
    }

    public oneOrMore<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        Rule<
            TTarget,
            ValueOfRule<TRule>[],
            TPrevEnv,
            Empty
        >
    {
        return new OneOrMoreRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            ValueOfRule<TRule>[],
            TPrevEnv,
            Empty
        >;
    }

    public ref<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        Rule<
            TTarget,
            ValueOfRule<TRule>,
            TPrevEnv,
            Empty
        >
    {
        return new RefRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            ValueOfRule<TRule>,
            TPrevEnv,
            Empty
        >;
    }

    public seqEqual<
        TValue extends ArrayLike<ItemOf<TTarget>>,
    >(
        sequence: TValue,
    ):
        Rule<
            TTarget,
            TValue,
            TPrevEnv,
            Empty
        >
    {
        return new SeqEqualRule(
            sequence,
            this.name,
        ) as unknown as Rule<
            TTarget,
            TValue,
            TPrevEnv,
            Empty
        >;
    }

    public sequence<
        TRule extends UnknownRule<TTarget>,
    >(
        immediateFunc: (emptySequence: SequenceRule<TTarget, undefined, TPrevEnv, Empty, "Empty">) => TRule,
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
                new RuleFactory<TTarget, TPrevEnv>() as this,
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
        Rule<
            TTarget,
            ValueOfRule<TRule>[],
            TPrevEnv,
            Empty
        >
    {
        return new ZeroOrMoreRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            ValueOfRule<TRule>[],
            TPrevEnv,
            Empty
        >;
    }

    public zeroOrOne<
        TRule extends UnknownRule<TTarget>,
    >(
        ruleOrFunc: RuleOrFunc<TRule, this>,
    ):
        Rule<
            TTarget,
            ValueOfRule<TRule> | null,
            TPrevEnv,
            Empty
        >
    {
        return new ZeroOrOneRule(
            convertRuleOrFunc(
                ruleOrFunc,
                new RuleFactory<TTarget, TPrevEnv>() as this,
            ) as TRule,
            this.name,
        ) as unknown as Rule<
            TTarget,
            ValueOfRule<TRule> | null,
            TPrevEnv,
            Empty
        >;
    }

    public regExp(
        regExp: RegExp,
    ):
        RegExpRule<
            TPrevEnv
        >
    {
        return new RegExpRule(
            regExp,
            this.name,
        );
    }

    public regExpObj(
        regExp: RegExp,
    ):
        RegExpObjRule<
            TPrevEnv
        >
    {
        return new RegExpObjRule(
            regExp,
            this.name,
        );
    }
}
