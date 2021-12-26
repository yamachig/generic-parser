import { BaseEnv, BasePos, Empty, MatchResult, Rule, UnknownTarget } from "../core";

export class RegExpRule<
    TPrevEnv extends BaseEnv<UnknownTarget, BasePos>
> extends Rule<
    string,
    string,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "RegExpRule" as const;

    public constructor(
        public regExp: RegExp,
        name: string | null = null,
    ) {
        super(name);
    }

    public match(
        offset: number,
        target: string,
        env: TPrevEnv,
    ): MatchResult<
        string,
        TPrevEnv
    > {
        const m = this.regExp.exec(target.slice(offset));
        if (m) {
            return {
                ok: true,
                nextOffset: offset + m[0].length,
                value: m[0],
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

    public toString(): string { return this.name ?? `/${this.regExp.source}/`; }
}
