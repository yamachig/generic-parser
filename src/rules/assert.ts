import { ActionEnv, BaseEnv, BasePos, Empty, makeActionEnv, MatchResult, PosOf, Rule, UnknownTarget } from "../core";

export class AssertRule<
    TTarget extends UnknownTarget,
    TPrevEnv extends BaseEnv<TTarget, BasePos>
> extends Rule<
    TTarget,
    undefined,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "AssertRule" as const;

    public constructor(
        public func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => unknown,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        undefined,
        TPrevEnv
    > {
        const value = this.func(makeActionEnv(
            offset,
            offset,
            target,
            env as unknown as BaseEnv<UnknownTarget, PosOf<TPrevEnv>>,
        ) as unknown as ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv);
        if (value) {
            return {
                ok: true,
                nextOffset: offset,
                value: undefined,
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

    public toString(): string { return this.name ?? "${assert}"; }
}
