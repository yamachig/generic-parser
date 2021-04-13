import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, Empty, MatchResult } from "./common";
import { RuleFactory } from "./factory";
import { SeqEqualRule } from "./seqEqual";
import { SequenceRule } from "./sequence";
import { stringOffsetToPos, StringPos } from "./string/env";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test SequenceRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const expected = {
            ok: true,
            nextPos: 9,
            value: ["abc", "abc", "abc"],
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule0 = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => {
                const _s: SequenceRule<
                    string,
                    [],
                    undefined,
                    DummyStringEnv,
                    Empty,
                    "Empty",
                    RuleFactory<string, DummyStringEnv>
                > = s;
                void _s;
                return s.and(r => {
                    const _r: RuleFactory<
                        string,
                        DummyStringEnv
                    > = r;
                    void _r;
                    return r.seqEqual("abc");
                }, "a");
            });
        const res0: MatchResult<
            string,
            DummyStringEnv & {
                a: string,
            }
        > = rule0.match(0, "abc", getDummyStringEnv());
        void res0;

        const rule1 = rule0
            .and(r => {
                const _r: RuleFactory<
                    string,
                    DummyStringEnv & {
                        a: string;
                    }
                > = r;
                void _r;
                return r.seqEqual("abc");
            });
        const res1: MatchResult<
            readonly [string, string],
            DummyStringEnv & {
                a: string,
            }
        > = rule1.match(0, "abc", getDummyStringEnv());
        void res1;

        const rule2 = rule1
            .and(r => {
                const _r: RuleFactory<
                    string,
                    DummyStringEnv & {
                        a: string;
                    }
                > = r;
                void _r;
                return r.seqEqual("abc");
            }, "b");

        const res2: MatchResult<
            readonly [string, string, string],
            DummyStringEnv & {
                a: string,
                b: string,
            }> = rule2.match(0, "abc", getDummyStringEnv());
        void res2;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );
        const result: MatchResult<
            readonly [string, string, string],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 12,
            value: ["abc", "def", "ghi"],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .choice(c => c
                .or(r => r.seqEqual("xyz"))
                .orSequence(s => s
                    .and(r => r.seqEqual("abc"), "a")
                    .and(r => r.seqEqual("def"))
                    .and(r => r.seqEqual("ghi"), "b")
                )
                .or(r => r.seqEqual("def"))
            );

        const result: MatchResult<
            readonly [string, string, string] | string,
            DummyStringEnv
        > = rule.match(pos, text, env);

        assert.deepEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcabcabc";
        const expected = {
            ok: true,
            nextPos: 12,
            value: ["abc", "abc", "abc"],
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );

        const result: MatchResult<
            readonly [string, string, string],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcabcabc";
        const expected = {
            ok: true,
            nextPos: 12,
            value: ["abc", "abc", "abc"],
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(() => new SeqEqualRule("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(() => new SeqEqualRule("abc"), "b")
            );

        const result: MatchResult<
            readonly [string, string, string],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextPos: 15,
            value: "mno",
        } as const;
        const expectedEnv = {
            item1: "abc",
            item2: "jkl",
            item3: "mno",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "item1", true)
                .and(r => r.seqEqual(["d", "e", "f"]), null, true)
                .and(r => r.seqEqual("ghi"), null, true)
                .and(r => r.seqEqual("jkl"), "item2", true)
                .and(r => r.seqEqual("mno"), "item3")
            );

        const result: MatchResult<
            string,
            DummyStringEnv & {
                item1: string,
                item2: string,
                item3: string,
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextPos: 15,
            value: "mno",
        } as const;
        const expectedEnv = {
            item1: "abc",
            item2: "jkl",
            item3: "mno",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "item1", true)
                .andOmit(r => r.seqEqual(["d", "e", "f"]), null)
                .and(r => r.seqEqual("ghi"), null, true)
                .andOmit(r => r.seqEqual("jkl"), "item2")
                .and(r => r.seqEqual("mno"), "item3")
            );

        const result: MatchResult<
            string,
            DummyStringEnv & {
                item1: string,
                item2: string,
                item3: string,
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextPos: 15,
            value: undefined,
        } as const;
        const expectedEnv = {
            item1: "abc",
            item2: "jkl",
            item3: "mno",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "item1", true)
                .and(r => r.seqEqual(["d", "e", "f"]), null, true)
                .and(r => r.seqEqual("ghi"), null, true)
                .and(r => r.seqEqual("jkl"), "item2", true)
                .andOmit(r => r.seqEqual("mno"), "item3")
            );

        const result: MatchResult<
            undefined,
            DummyStringEnv & {
                item1: string,
                item2: string,
                item3: string,
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextPos: 15,
            value: [
                "abc",
                ["d", "e", "f"] as string[],
                "mno",
            ],
        } as const;
        const expectedEnv = {
            item1: "abc",
            item2: "jkl",
            item3: "mno",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "item1")
                .and(r => r.seqEqual(["d", "e", "f"]))
                .and(r => r.seqEqual("ghi"), null, true)
                .and(r => r.seqEqual("jkl"), "item2", true)
                .and(r => r.seqEqual("mno"), "item3")
            );

        const result: MatchResult<
            readonly [string, string[], string],
            DummyStringEnv & {
                item1: string,
                item2: string,
                item3: string,
            }
        > = rule.match(pos, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const pos = 3;
        const text = ["x", "y", "z", "a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const expected = {
            ok: true,
            nextPos: 12,
            value: [
                ["a", "b", "c"] as string[],
                "abc",
                "abc",
            ],
        } as const;
        const expectedEnv = {
            a: ["a", "b", "c"] as string[],
            b: "abc",
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .sequence(s => s
                .and(r => r.seqEqual(["a", "b", "c"]), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );
        const result: MatchResult<
            readonly [string[], string, string],
            DummyStringArrayEnv & {
                a: string[];
                b: string;
            }
        > = rule.match(pos, text, getDummyStringArrayEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcabc";
        const expected = {
            ok: false,
            pos: 9,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );
        const result = rule.match(pos, text, getDummyStringEnv());

        assert.deepEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcabc";
        const expected = {
            ok: false,
            pos: 9,
            expected: "<3 abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<3 abc rule>")
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );
        const result = rule.match(pos, text, getDummyStringEnv());

        assert.deepEqual(result, expected);
    });

});
