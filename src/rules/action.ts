import { AddEnvOfRule, makeActionEnv, MatchResult, NewEnvOfRule, PrevEnvOfRule, Rule, TargetOfRule, UnknownRule, UnknownTarget, AddActionForRule } from "../core";

export class ActionRule<
    TRule extends UnknownRule<UnknownTarget>,
    TValue
> extends Rule<
    TargetOfRule<TRule>,
    TValue,
    PrevEnvOfRule<TRule>,
    AddEnvOfRule<TRule>
> {
    public readonly classSignature = "ActionRule" as const;

    public constructor(
        public rule: TRule,
        public func: (
            env: AddActionForRule<TRule>
        ) => TValue,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TargetOfRule<TRule>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        TValue,
        NewEnvOfRule<TRule>
    > {
        const result = this.rule.match(pos, target, env);

        if (result.ok) {
            const newEnv = result.env;
            const value = this.func(
                makeActionEnv(
                    pos,
                    result.nextPos,
                    target,
                    newEnv,
                ) as unknown as AddActionForRule<TRule>
            );
            return {
                ok: true,
                nextPos: result.nextPos,
                value,
                env: newEnv as NewEnvOfRule<TRule>,
            };
        } else {
            return result;
        }

    }

    public toString(): string { return this.name ?? "<action>"; }
}
