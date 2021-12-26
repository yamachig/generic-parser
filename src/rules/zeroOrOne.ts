import { MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, Empty, UnknownTarget } from "../core";

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

    public match(
        offset: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        ValueOfRule<TRule> | null,
        PrevEnvOfRule<TRule>
    > {

        if (offset < target.length) {
            const result = this.rule.match(offset, target, env);
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

    public toString(): string { return this.name ?? `(${this.rule.toString()})?`; }
}
