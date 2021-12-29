import { BaseEnv, BasePos, Empty, MatchResult, Rule, WithIncludes } from "../core";

export class OneOfRule<
    TItem,
    TTarget extends ArrayLike<TItem>,
    TPrevEnv extends BaseEnv<TTarget, BasePos>
> extends Rule<
    TTarget,
    TItem,
    TPrevEnv,
    Empty
> {
    public readonly classSignature = "OneOfRule" as const;

    public constructor(
        public items: WithIncludes<TItem>,
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        TItem,
        TPrevEnv
    > {
        if (offset < target.length && this.items.includes(target[offset])) {
            return {
                ok: true,
                nextOffset: offset + 1,
                value: target[offset],
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
    }

    public toString(): string {
        if (this.name !== null) {
            return this.name;
        } else if (typeof this.items === "string") {
            return `[${this.items}]`;
        } else if (Array.isArray(this.items)) {
            return `<one of ${JSON.stringify(this.items)}>`;
        } else if (typeof this.items.toString === "function") {
            return `<one of ${this.items.toString()}>`;
        } else {
            return `${this.items}`;
        }
    }
}

