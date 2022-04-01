import { assert } from "chai";
import { SeqEqualRule } from "./seqEqual";
import { BaseEnv, getMemorizedStringOffsetToPos, StringPos } from "../core";
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

describe("Test NextIsRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(() => insideRule);
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: undefined,
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: undefined,
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "&(\"abc\")",
            prevFail: {
                ok: false,
                offset: 0,
                expected: "\"abc\"",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIs(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "<abc rule>",
            prevFail: {
                ok: false,
                offset: 0,
                expected: "\"abc\"",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>").
            nextIs(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
