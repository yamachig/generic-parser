import { BaseEnv, BasePos, Empty, MatchResult, Rule } from "../../core";

export class RegExpRule<
    TPrevEnv extends BaseEnv<string, BasePos>
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
        pos: number,
        target: string,
        env: TPrevEnv,
    ): MatchResult<
        string,
        TPrevEnv
    > {
        const m = this.regExp.exec(target.slice(pos));
        if (m) {
            return {
                ok: true,
                nextPos: pos + m[0].length,
                value: m[0],
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

    public toString(): string { return this.name ?? `/${this.regExp.source}/`; }
}
