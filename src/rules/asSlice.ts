import { Empty, MatchResult, PrevEnvOfRule, Rule, Sliceable, TargetOfRule, UnknownRule, UnknownTarget } from "./common";

export class AsSliceRule<
    TSlice,
    TRule extends UnknownRule<UnknownTarget>,
> extends Rule<
    TargetOfRule<TRule>,
    TSlice,
    PrevEnvOfRule<TRule>,
    Empty
> {
    public readonly classSignature = "AsSliceRule" as const;

    public constructor(
        public rule: TRule,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TargetOfRule<TRule> & Sliceable<TSlice>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        TSlice,
        PrevEnvOfRule<TRule>
    > {

        const result = this.rule.match(pos, target, env);

        if (result.ok) {
            return {
                ok: true,
                nextPos: result.nextPos,
                value: target.slice(pos, result.nextPos) as TSlice,
                env,
            };
        } else {
            return result;
        }

    }

    public toString(): string { return this.name ?? `$(${this.rule.toString()})`; }
}
