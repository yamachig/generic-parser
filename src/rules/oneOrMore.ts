import { Empty, MatchResult, PrevEnvOfRule, ValueOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget } from "./common";

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
        pos: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        ValueOfRule<TRule>[],
        PrevEnvOfRule<TRule>
    > {

        const value: unknown[] = [];

        let nextPos = pos;

        if (nextPos >= target.length) {
            return {
                ok: false,
                pos: nextPos,
                expected: this.toString(),
            };
        }

        const result = this.rule.match(nextPos, target, env);
        if (!result.ok) {
            return this.name === null
                ? result
                : {
                    ok: false,
                    pos: nextPos,
                    expected: this.toString(),
                };
        }
        nextPos = result.nextPos;
        value.push(result.value);

        while (nextPos < target.length) {
            const result = this.rule.match(nextPos, target, env);
            if (!result.ok) break;
            nextPos = result.nextPos;
            value.push(result.value);
        }

        return {
            ok: true,
            nextPos,
            value: value as ValueOfRule<TRule>[],
            env,
        };
    }

    public toString(): string { return this.name ?? `(${this.rule.toString()})+`; }
}
