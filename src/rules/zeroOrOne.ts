import { MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, Empty, UnknownTarget } from "./common";

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
        pos: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        ValueOfRule<TRule> | null,
        PrevEnvOfRule<TRule>
    > {

        if (pos < target.length) {
            const result = this.rule.match(pos, target, env);
            if (result.ok) {
                return {
                    ok: true,
                    nextPos: result.nextPos,
                    value: result.value as ValueOfRule<TRule>,
                    env,
                };
            }
        }
        return {
            ok: true,
            nextPos: pos,
            value: null,
            env,
        };

    }

    public toString(): string { return this.name ?? `(${this.rule.toString()})?`; }
}
