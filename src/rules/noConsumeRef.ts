import { MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget, AddEnvOfRule, NewEnvOfRule, MatchSuccess, MatchContext } from "../core";

export class NoConsumeRefRule<
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    ValueOfRule<TRule>,
    PrevEnvOfRule<TRule>,
    AddEnvOfRule<TRule>
> {
    public readonly classSignature = "NoConsumeRefRule" as const;

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
        ValueOfRule<TRule>,
        NewEnvOfRule<TRule>
    > {
        const result = this.rule.match(offset, target, env, context);
        if (result.ok) {
            return {
                ...result,
                nextOffset: offset,
            } as MatchSuccess<ValueOfRule<TRule>, NewEnvOfRule<TRule>>;
        } else {
            return {
                ok: false,
                offset,
                expected: this,
                prevFail: result,
            };
        }
    }

    public toString(options?: {fullToString?: boolean, maxToStringDepth?: number}, currentDepth = 0): string {
        if (options?.maxToStringDepth !== undefined && options?.maxToStringDepth < currentDepth) return "...";
        return this.name ?? `&(${this.rule.toString(options, currentDepth + 1)})`;
    }
}
