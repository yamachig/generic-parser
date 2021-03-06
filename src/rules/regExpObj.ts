import { BaseEnv, BasePos, Empty, MatchResult, Rule, UnknownTarget } from "../core";

export class RegExpObjRule<
    TPrevEnv extends BaseEnv<UnknownTarget, BasePos>
> extends Rule<
    string,
    RegExpExecArray,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "RegExpObjRule" as const;

    public constructor(
        public regExp: RegExp,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: string,
        env: TPrevEnv,
    ): MatchResult<
        RegExpExecArray,
        TPrevEnv
    > {
        const value = this.regExp.exec(target.slice(offset));
        if (value) {
            return {
                ok: true,
                nextOffset: offset + value[0].length,
                value,
                env,
            };
        } else {
            return {
                ok: false,
                offset,
                expected: this,
                prevFail: null,
            };
        }
    }

    public toString(): string { return this.name ?? `/${this.regExp.source}/`; }
}
