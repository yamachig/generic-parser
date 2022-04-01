import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, getMemorizedStringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: getMemorizedStringOffsetToPos(),
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test AsSliceRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r
                .seqEqual("abc")
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r.seqEqual(["a", "b", "c"]));

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: "abcabcabc",
            env,
        } as const;

        const innerRule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("abc"))
                .and(r => r.seqEqual("abc"), "b")
            );

        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(() => innerRule);

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = ["a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: ["a", "b", "c", "a", "b", "c", "a", "b", "c"] as string[],
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .asSlice(r => r
                .sequence(s => s
                    .and(r => r.seqEqual(["a", "b", "c"]), "a")
                    .and(r => r.seqEqual(["a", "b", "c"]))
                    .and(r => r.seqEqual(["a", "b", "c"]), "b")
                )
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 12,
            value: "abcabcabc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("abc"), "a")
                    .and(r => r.seqEqual("abc"))
                    .and(r => r.seqEqual("abc"), "b")
                )
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "$(\"abc\" \"abc\" \"abc\")",
            prevFail: {
                ok: false,
                offset: 3,
                expected: "\"abc\" \"abc\" \"abc\"",
                prevFail: {
                    ok: false,
                    offset: 9,
                    expected: "\"abc\"",
                    prevFail: null,
                },
            },
        } as const;


        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("abc"), "a")
                    .and(r => r.seqEqual("abc"))
                    .and(r => r.seqEqual("abc"), "b")
                )
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "<xyzabcabc rule>",
            prevFail: {
                ok: false,
                offset: 3,
                expected: "\"abc\" \"abc\" \"abc\"",
                prevFail: {
                    ok: false,
                    offset: 9,
                    expected: "\"abc\"",
                    prevFail: null,
                },
            },
        } as const;


        const rule = new RuleFactory<string, DummyStringEnv>("<xyzabcabc rule>")
            .asSlice(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("abc"), "a")
                    .and(r => r.seqEqual("abc"))
                    .and(r => r.seqEqual("abc"), "b")
                )
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });


});
