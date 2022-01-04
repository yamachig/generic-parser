import { ActionEnv, BaseEnv, BasePos, Empty, makeActionEnv, MatchResult, PosOf, Rule, UnknownTarget } from "../core";

export class OneMatchRule<
    TItem,
    TValue extends NonNullable<unknown>,
    TTarget extends ArrayLike<TItem>,
    TPrevEnv extends BaseEnv<TTarget, BasePos>
> extends Rule<
    TTarget,
    TValue,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "OneMatchRule" as const;

    public constructor(
        public func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv & { item: TItem }) => TValue | null | undefined,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        TValue,
        TPrevEnv
    > {
        if (offset < target.length) {
            const value = this.func(makeActionEnv(
                offset,
                offset,
                target,
                {
                    ...env,
                    item: target[offset],
                } as unknown as BaseEnv<UnknownTarget, PosOf<TPrevEnv>>,
            ) as unknown as ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv & { item: TItem });
            if (value !== undefined && value !== null) {
                return {
                    ok: true,
                    nextOffset: offset + 1,
                    value,
                    env,
                };
            } else {
                return {
                    ok: false,
                    offset,
                    expected: this.toString(),
                    prevFail: null,
                };
            }
        } else {
            return {
                ok: false,
                offset,
                expected: this.toString(),
                prevFail: null,
            };
        }
    }

    public toString(): string { return this.name ?? ".${assert}"; }
}

