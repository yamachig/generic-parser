import { AssertRule } from "./assert.ts";
import { AssertNotRule } from "./assertNot.ts";
import { BaseEnv, UnknownRule, UnknownTarget, ItemOf, WithIncludes, SliceOf, Empty, Rule, BasePos, AddActionForRule, ActionEnv, PosOf, RuleOrFunc, convertRuleOrFunc, ValueOfRule, AddEnvOfRule, PrevEnvOfRule, MatchFail, MatchResult, NewEnvOfRule } from "../core/index.ts";
import { NextIsRule } from "./nextIs.ts";
import { NextIsNotRule } from "./nextIsNot.ts";
import { OneOfRule } from "./oneOf.ts";
import { OneOrMoreRule } from "./oneOrMore.ts";
import { ActionRule } from "./action.ts";
import { SeqEqualRule } from "./seqEqual.ts";
import { SequenceRule } from "./sequence.ts";
import { ZeroOrMoreRule } from "./zeroOrMore.ts";
import { ZeroOrOneRule } from "./zeroOrOne.ts";
import { RefRule } from "./ref.ts";
import { AnyOneRule } from "./anyOne.ts";
import { AsSliceRule } from "./asSlice.ts";
import { ChoiceRule } from "./choice.ts";
import { RegExpRule } from "./regExp.ts";
import { RegExpObjRule } from "./regExpObj.ts";
import { OneMatchRule } from "./oneMatch.ts";
import { NoConsumeRefRule } from "./noConsumeRef.ts";

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

    public noConsumeRef<
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
        return new NoConsumeRefRule(
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

    public oneMatch<
        TItem extends ItemOf<TTarget>,
        TValue extends NonNullable<unknown>,
    >(
        func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv & { item: TItem }) => TValue | null | undefined,
    ):
        Rule<
            TTarget,
            TValue,
            TPrevEnv,
            Empty
        >
    {
        return new OneMatchRule(
            func as unknown as ((env: ActionEnv<ArrayLike<TItem>, BasePos> & BaseEnv<ArrayLike<TItem>, BasePos> & { item: TItem; }) => TValue | null | undefined),
            this.name,
        ) as unknown as Rule<
            TTarget,
            TValue,
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
