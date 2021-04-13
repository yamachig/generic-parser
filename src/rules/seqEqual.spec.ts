import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, MatchResult } from "./common";
import { RuleFactory } from "./factory";
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

describe("Test SeqEqualRule", () => {

    it("Success case", () => {
        const sequence = "abc";
        const pos = 0;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = "abc";
        const pos = 0;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = ["a", "b", "c"];
        const pos = 0;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: ["a", "b", "c"] as string[],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string[], DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = "abc";
        const pos = 0;
        const text = ["a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringArrayEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });


    it("Success case", () => {
        const sequence = "abc";
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = ["a", "b", "c"] as ArrayLike<string>;
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: ["a", "b", "c"],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<ArrayLike<string>, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const sequence = ["a", "b", "c"] as ArrayLike<string>;
        const pos = 3;
        const text = ["x", "y", "z", "a", "b", "c", "d", "e", "f", "g"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: ["a", "b", "c"],
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .seqEqual(sequence);
        const result: MatchResult<ArrayLike<string>, DummyStringArrayEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const sequence = "abc";
        const pos = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const sequence = "abc";
        const pos = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const sequence = "abc";
        const pos = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos,
            expected: "<abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>")
            .seqEqual(sequence);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
