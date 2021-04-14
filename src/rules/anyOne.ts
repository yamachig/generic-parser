import { BaseEnv, BasePos, Empty, ItemOf, MatchResult, Rule, UnknownTarget } from "../core";

export class AnyOneRule<
    TTarget extends UnknownTarget = never,
    TPrevEnv extends BaseEnv<TTarget, BasePos> = BaseEnv<TTarget, BasePos>
> extends Rule<
    TTarget,
    ItemOf<TTarget>,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "AnyOneRule" as const;

    public constructor(
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        ItemOf<TTarget>,
        TPrevEnv
    > {
        if (pos < target.length) {
            return {
                ok: true,
                nextPos: pos + 1,
                value: target[pos] as ItemOf<TTarget>,
                env,
            };
        } else {
            return {
                ok: false,
                pos,
                expected: this.toString(),
            };
        }
    }

    public toString(): string { return this.name ?? "."; }
}
