import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, MatchResult, getMemorizedStringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";
import { SeqEqualRule } from "./seqEqual";
import { SequenceRule } from "./sequence";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: getMemorizedStringOffsetToPos(),
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test SequenceRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const expected = {
            ok: true,
            nextOffset: 9,
            value: ["abc", "abc", "abc"],
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule0 = new SequenceRule(
            [],
            new RuleFactory<string, DummyStringEnv>(),
            null,
        ).and(r => {
            return r.seqEqual("abc");
        }, "a");
        const res0 = rule0.match(0, "abc", getDummyStringEnv());
        void res0;

        const rule1 = rule0
            .and(r => {
                return r.seqEqual("abc");
            });
        const res1 = rule1.match(0, "abc", getDummyStringEnv());
        void res1;

        const rule2 = rule1
            .and(r => {
                return r.seqEqual("abc");
            }, "b");

        const res2 = rule2.match(0, "abc", getDummyStringEnv());
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 12,
            value: ["abc", "def", "ghi"] as [string, string, string],
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

        const result = rule.match(offset, text, env);

        assert.deepEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcabcabc";
        const expected = {
            ok: true,
            nextOffset: 12,
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcabcabc";
        const expected = {
            ok: true,
            nextOffset: 12,
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextOffset: 15,
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextOffset: 15,
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextOffset: 15,
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghijklmno";
        const expected = {
            ok: true,
            nextOffset: 15,
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
        > = rule.match(offset, text, getDummyStringEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 3;
        const text = ["x", "y", "z", "a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const expected = {
            ok: true,
            nextOffset: 12,
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
        > = rule.match(offset, text, getDummyStringArrayEnv());

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const expected = {
            ok: false,
            offset: 3,
            expected: "\"abc\" \"abc\" \"abc\"",
            prevFail: {
                ok: false,
                offset: 9,
                expected: "\"abc\"",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );
        const result = rule.match(offset, text, getDummyStringEnv());

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const expected = {
            ok: false,
            offset: 3,
            expected: "<3 abc rule>",
            prevFail: {
                ok: false,
                offset: 9,
                expected: "\"abc\"",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<3 abc rule>")
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );
        const result = rule.match(offset, text, getDummyStringEnv());

        assert.deepStrictEqual(result, expected);
    });

});
