import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test AsSliceRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r
                .seqEqual("abc")
            );

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r.seqEqual(["a", "b", "c"]));

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 9,
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

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 0;
        const text = ["a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextPos: 9,
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

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 12,
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

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 9,
            expected: "\"abc\"",
        } as const;


        const rule = new RuleFactory<string, DummyStringEnv>()
            .asSlice(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("abc"), "a")
                    .and(r => r.seqEqual("abc"))
                    .and(r => r.seqEqual("abc"), "b")
                )
            );

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 9,
            expected: "<xyzabcabc rule>",
        } as const;


        const rule = new RuleFactory<string, DummyStringEnv>("<xyzabcabc rule>")
            .asSlice(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("abc"), "a")
                    .and(r => r.seqEqual("abc"))
                    .and(r => r.seqEqual("abc"), "b")
                )
            );

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });


});
