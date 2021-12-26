import { Empty, MatchResult, PrevEnvOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget } from "../core";

export class NextIsNotRule<
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    undefined,
    PrevEnvOfRule<TRule>,
    Empty
> {
    public readonly classSignature = "NextIsNotRule" as const;

    public constructor(
        public rule: TRule,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        offset: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        undefined,
        PrevEnvOfRule<TRule>
    > {

        const result = this.rule.match(offset, target, env);
        if (result.ok) {
            return {
                ok: false,
                offset,
                expected: this.toString(env.toStringOptions),
                prevFail: null,
                stack: env.getStack(),
            };
        } else {
            return {
                ok: true,
                nextOffset: offset,
                value: undefined,
                env,
            };
        }

    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `!(${this.rule.toString(options, currentDepth + 1)})`;
    }
}
