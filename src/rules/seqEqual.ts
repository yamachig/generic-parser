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

    public match(
        pos: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        TValue,
        TPrevEnv
    > {

        if (target.length >= pos + this.sequence.length) {
            for (let offset = 0; offset < this.sequence.length; offset++) {
                if (target[pos + offset] !== this.sequence[offset]) {
                    return {
                        ok: false,
                        pos,
                        expected: this.toString(),
                    };
                }
            }
            return {
                ok: true,
                nextPos: pos + this.sequence.length,
                value: this.sequence,
                env,
            };
        }

        return {
            ok: false,
            pos,
            expected: this.toString(),
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
