import { Empty, MatchResult, PrevEnvOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget, MatchContext } from "../core";

export class NextIsRule<
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    undefined,
    PrevEnvOfRule<TRule>,
    Empty
> {
    public readonly classSignature = "NextIsRule" as const;

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
        undefined,
        PrevEnvOfRule<TRule>
    > {

        const result = this.rule.match(offset, target, env, context);
        if (result.ok) {
            return {
                ok: true,
                nextOffset: offset,
                value: undefined,
                env,
            };
        } else {
            return {
                ok: false,
                offset,
                expected: this.toString(env.toStringOptions),
                prevFail: result,
            };
        }

    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `&(${this.rule.toString(options, currentDepth + 1)})`;
    }
}
