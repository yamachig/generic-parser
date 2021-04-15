import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    registerCurrentLocation: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    registerCurrentLocation: () => { /**/ },
    options: {},
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test OneOfRule", () => {

    it("Success case", () => {
        const items = "abc";
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = "abc";
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = ["a", "b", "c"];
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = "abc";
        const pos = 0;
        const text = ["a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = "abc";
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 4,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const items = ["a", "b", "c"];
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 4,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "abc";
        const pos = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "[abc]",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "";
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 3,
            expected: "[]",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "abc";
        const pos = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "[abc]",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = ["a", "b", "c"];
        const pos = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "<one of [\"a\",\"b\",\"c\"]>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const items = "abc";
        const pos = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "<one of abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<one of abc rule>")
            .oneOf(items);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
