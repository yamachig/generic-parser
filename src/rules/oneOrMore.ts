import { Empty, MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget } from "../core";

export class OneOrMoreRule<
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    ValueOfRule<TRule>[],
    PrevEnvOfRule<TRule>,
    Empty
> {
    public readonly classSignature = "OneOrMoreRule" as const;

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
        ValueOfRule<TRule>[],
        PrevEnvOfRule<TRule>
    > {

        const value: unknown[] = [];

        let nextOffset = offset;

        if (nextOffset >= target.length) {
            return {
                ok: false,
                offset: nextOffset,
                expected: this.toString(env.toStringOptions),
                prevFail: null,
                stack: env.getStack(),
            };
        }

        const result = this.rule.match(nextOffset, target, env);
        if (!result.ok) {
            return {
                ok: false,
                offset,
                expected: this.toString(env.toStringOptions),
                prevFail: result,
                stack: env.getStack(),
            };
        }
        nextOffset = result.nextOffset;
        value.push(result.value);

        while (nextOffset < target.length) {
            const result = this.rule.match(nextOffset, target, env);
            if (!result.ok) break;
            nextOffset = result.nextOffset;
            value.push(result.value);
        }

        return {
            ok: true,
            nextOffset,
            value: value as ValueOfRule<TRule>[],
            env,
        };
    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `(${this.rule.toString(options, currentDepth + 1)})+`;
    }
}
