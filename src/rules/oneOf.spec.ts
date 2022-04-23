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

describe("Test OneOfRule", () => {

    it("Success case", () => {
        const items = "abc";
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = "abc";
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = ["a", "b", "c"];
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = "abc";
        const offset = 0;
        const text = ["a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = "abc";
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 4,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = ["a", "b", "c"];
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 4,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "abc";
        const offset = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "[abc]",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "";
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "[]",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "abc";
        const offset = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "[abc]",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = ["a", "b", "c"];
        const offset = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "<one of [\"a\",\"b\",\"c\"]>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "abc";
        const offset = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "<one of abc rule>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<one of abc rule>")
            .oneOf(items);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
