import { assert } from "chai";
import { SeqEqualRule } from "./seqEqual";
import { BaseEnv, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

describe("Test NextIsRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 0,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(() => insideRule);
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const pos = 0;
        const text = "abcabcg";
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
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const pos = 0;
        const text = "abcabcg";
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
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 3,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "\"abc\"",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "<abc rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>").
            nextIs(r => r.seqEqual("abc"));
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
