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
        offset: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        ItemOf<TTarget>,
        TPrevEnv
    > {
        if (offset < target.length) {
            return {
                ok: true,
                nextOffset: offset + 1,
                value: target[offset] as ItemOf<TTarget>,
                env,
            };
        } else {
            return {
                ok: false,
                offset,
                expected: this.toString(),
            };
        }
    }

    public toString(): string { return this.name ?? "."; }
}
