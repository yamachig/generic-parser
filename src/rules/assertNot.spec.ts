import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, MatchResult, getMemorizedStringOffsetToPos, StringPos, matchResultToJson } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: getMemorizedStringOffsetToPos(),
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test AssertNotRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: undefined,
        } as const;
        const expectedEnv = {
            a: undefined,
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.assertNot(() => false), "a")
            );

        const result: MatchResult<
            undefined,
            DummyStringEnv & {
                a: undefined;
            }
        > = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = ["a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: [
                ["a", "b", "c"] as string[],
                ["a", "b", "c"] as string[],
                ["a", "b", "c"] as string[],
                undefined,
            ],
        } as const;
        const expectedEnv = {
            a: ["a", "b", "c"],
            b: ["a", "b", "c"],
        };

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .sequence(s => s
                .and(r => r.seqEqual(["a", "b", "c"]), "a")
                .and(r => r.seqEqual(["a", "b", "c"]))
                .and(r => r.seqEqual(["a", "b", "c"]), "b")
                .and(r => r.assertNot(({ a, b }) => a[0] !== b[0]))
            );

        const result: MatchResult<
            readonly [string[], string[], string[], undefined],
            DummyStringArrayEnv & {
                a: string[];
                b: string[];
            }
        > = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 12,
            value: [
                "abc",
                "abc",
                undefined,
                "abc",
            ],
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.assertNot(env => env.a !== "abc"), "c")
                .and(r => r.seqEqual("abc"), "b")
            );

        const result: MatchResult<
            readonly [string, string, undefined, string],
            DummyStringEnv & {
                a: string;
                b: string;
                c: undefined;
            }
        > = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "\"abc\" \"abc\" !{assert} \"abc\"",
            prevFail: {
                ok: false,
                offset: 9,
                expected: "!{assert}",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.assertNot(() => true))
                .and(r => r.seqEqual("abc"), "b")
            );

        const result: MatchResult<
            [string, string, undefined, string],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "<not xyzabcabc rule>",
            prevFail: {
                ok: false,
                offset: 9,
                expected: "!{assert}",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<not xyzabcabc rule>")
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.assertNot(() => true))
                .and(r => r.seqEqual("abc"), "b")
            );

        const result: MatchResult<
            [string, string, undefined, string],
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

});
