import { Empty, MatchResult, PrevEnvOfRule, Rule, Sliceable, TargetOfRule, UnknownRule, UnknownTarget } from "../core";

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
        offset: number,
        target: TargetOfRule<TRule> & Sliceable<TSlice>,
        env: PrevEnvOfRule<TRule>,
    ): MatchResult<
        TSlice,
        PrevEnvOfRule<TRule>
    > {

        const result = this.rule.match(offset, target, env);

        if (result.ok) {
            return {
                ok: true,
                nextOffset: result.nextOffset,
                value: target.slice(offset, result.nextOffset) as TSlice,
                env,
            };
        } else {
            return result;
        }

    }

    public toString(): string { return this.name ?? `$(${this.rule.toString()})`; }
}
