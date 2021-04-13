import { assert } from "chai";
import { BaseEnv, MatchResult } from "./common";
import { RuleFactory } from "./factory";
import { stringOffsetToPos, StringPos } from "./string/env";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

// const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
// const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
//     [dummyStringArraySymbol]: "dummy",
//     offsetToPos: arrayLikeOffsetToPos,
// });
// type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test ZeroOrMoreRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: ["abc", "abc"],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const result: MatchResult<readonly string[], DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: ["abc", "abc"],
            env,
        } as const;

        const result: MatchResult<readonly string[], DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: ["abc", "abc"] as string[],
            env,
        } as const;

        const result: MatchResult<string[], DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 6,
            value: ["abc"],
            env,
        } as const;

        const result: MatchResult<readonly string[], DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: [],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const result: MatchResult<readonly string[], DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
