import { ActionEnv, BaseEnv, BasePos, Empty, makeActionEnv, MatchResult, PosOf, Rule, UnknownTarget } from "./common";

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
        public func: (env: ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv) => boolean,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        pos: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        undefined,
        TPrevEnv
    > {
        const value = this.func(makeActionEnv(
            pos,
            pos,
            target,
            env as unknown as BaseEnv<UnknownTarget, PosOf<TPrevEnv>>,
        ) as unknown as ActionEnv<TTarget, PosOf<TPrevEnv>> & TPrevEnv);
        if (value) {
            return {
                ok: true,
                nextPos: pos,
                value: undefined,
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

    public toString(): string { return this.name ?? "${assert}"; }
}
