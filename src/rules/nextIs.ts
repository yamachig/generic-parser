import { Empty, MatchResult, PrevEnvOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget } from "../core";

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
                ok: true,
                nextOffset: offset,
                value: undefined,
                env,
            };
        } else {
            return this.name === null
                ? result
                : {
                    ok: false,
                    offset,
                    expected: this.toString(),
                };
        }

    }

    public toString(): string { return this.name ?? `&(${this.rule.toString()})`; }
}
