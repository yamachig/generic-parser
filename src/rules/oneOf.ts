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

    public match(
        pos: number,
        target: TTarget,
        env: TPrevEnv,
    ): MatchResult<
        TItem,
        TPrevEnv
    > {
        if (pos < target.length && this.items.includes(target[pos])) {
            return {
                ok: true,
                nextPos: pos + 1,
                value: target[pos],
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

