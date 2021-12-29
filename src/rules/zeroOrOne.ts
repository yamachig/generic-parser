import { MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, Empty, UnknownTarget, MatchContext } from "../core";

export class ZeroOrOneRule<
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    ValueOfRule<TRule> | null,
    PrevEnvOfRule<TRule>,
    Empty
> {
    public readonly classSignature = "ZeroOrOneRule" as const;

    public constructor(
        public rule: TRule,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
        context: MatchContext,
    ): MatchResult<
        ValueOfRule<TRule> | null,
        PrevEnvOfRule<TRule>
    > {

        if (offset < target.length) {
            const result = this.rule.match(offset, target, env, context);
            if (result.ok) {
                return {
                    ok: true,
                    nextOffset: result.nextOffset,
                    value: result.value as ValueOfRule<TRule>,
                    env,
                };
            }
        }
        return {
            ok: true,
            nextOffset: offset,
            value: null,
            env,
        };

    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `(${this.rule.toString(options, currentDepth + 1)})?`;
    }
}
