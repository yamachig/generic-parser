import { BaseEnv, BasePos, Empty, ItemOf, MatchResult, Rule } from "../core";

export class SeqEqualRule<
    TTarget extends ArrayLike<ItemOf<TValue>>,
    TValue extends ArrayLike<unknown>,
    TPrevEnv extends BaseEnv<TTarget, BasePos>,
> extends Rule<TTarget, TValue, TPrevEnv, Empty> {
    public readonly classSignature = "SeqEqualRule" as const;

    public constructor(
        public sequence: TValue,
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

        if (target.length >= offset + this.sequence.length) {
            for (let i = 0; i < this.sequence.length; i++) {
                if (target[offset + i] !== this.sequence[i]) {
                    return {
                        ok: false,
                        offset,
                        expected: this,
                        prevFail: null,
                    };
                }
            }
            return {
                ok: true,
                nextOffset: offset + this.sequence.length,
                value: this.sequence,
                env,
            };
        }

        return {
            ok: false,
            offset,
            expected: this,
            prevFail: null,
        };
    }

    public toString(): string {
        if (this.name !== null) {
            return this.name;
        } else if (typeof this.sequence === "string") {
            return `"${this.sequence}"`;
        } else if (Array.isArray(this.sequence)) {
            return `${JSON.stringify(this.sequence)}`;
        } else if (typeof this.sequence.toString === "function") {
            return `${this.sequence.toString()}`;
        } else {
            return `${this.sequence}`;
        }
    }
}
