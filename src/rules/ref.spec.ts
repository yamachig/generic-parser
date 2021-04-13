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

describe("Test RefRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const result: MatchResult<string | null, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const result: MatchResult<string | null, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const result: MatchResult<string | null, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
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
            .ref(r => r.seqEqual("abc"));
        const result: MatchResult<string | null, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const result: MatchResult<string | null, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos,
            expected: "<abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>")
            .ref(r => r.seqEqual("abc"));
        const result: MatchResult<string | null, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
