import { assert } from "chai";
import { SeqEqualRule } from "./seqEqual";
import { BaseEnv } from "../core";
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

describe("Test NextIsNotRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot((r => r.seqEqual("abc")));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot(() => insideRule);
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: undefined,
            env,
        } as const;

        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 1;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot((r => r.seqEqual("abc")));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "!(\"abc\")",
        } as const;

        const rule = new RuleFactory()
            .nextIsNot(() => insideRule);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 3,
            expected: "!(\"abc\")",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot(() => insideRule);
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 3,
            expected: "<not abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<not abc rule>")
            .nextIsNot(r => r.seqEqual("abc"));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
