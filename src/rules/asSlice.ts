import { Empty, MatchResult, PrevEnvOfRule, Rule, Sliceable, TargetOfRule, UnknownRule, UnknownTarget, MatchContext, MatchFail } from "../core";

export class AsSliceRule<
    TSlice,
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    TSlice,
    PrevEnvOfRule<TRule>,
    Empty
> {
    public readonly classSignature = "AsSliceRule" as const;

    public constructor(
        public rule: TRule,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TargetOfRule<TRule> & Sliceable<TSlice>,
        env: PrevEnvOfRule<TRule>,
        context: MatchContext,
    ): MatchResult<
        TSlice,
        PrevEnvOfRule<TRule>
    > {

        const result = this.rule.match(offset, target, env, context);

        if (result.ok) {
            return {
                ok: true,
                nextOffset: result.nextOffset,
                value: target.slice(offset, result.nextOffset) as TSlice,
                env,
            };
        } else {
            return {
                ok: false,
                offset,
                expected: this,
                prevFail: result as MatchFail,
            };
        }

    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `$(${this.rule.toString(options, currentDepth + 1)})`;
    }
}
