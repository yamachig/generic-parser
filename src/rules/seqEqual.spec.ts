import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    getStack: () => "<stack>",
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    getStack: () => "<stack>",
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test SeqEqualRule", () => {

    it("Success case", () => {
        const sequence = "abc";
        const offset = 0;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = "abc";
        const offset = 0;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = ["a", "b", "c"];
        const offset = 0;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: ["a", "b", "c"] as string[],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = "abc";
        const offset = 0;
        const text = ["a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });


    it("Success case", () => {
        const sequence = "abc";
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = ["a", "b", "c"] as ArrayLike<string>;
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["a", "b", "c"],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = ["a", "b", "c"] as ArrayLike<string>;
        const offset = 3;
        const text = ["x", "y", "z", "a", "b", "c", "d", "e", "f", "g"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["a", "b", "c"],
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const sequence = "abc";
        const offset = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset,
            expected: "\"abc\"",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const sequence = "abc";
        const offset = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset,
            expected: "\"abc\"",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const sequence = "abc";
        const offset = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset,
            expected: "<abc rule>",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>")
            .seqEqual(sequence);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
