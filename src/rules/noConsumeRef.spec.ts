import { assert } from "chai";
import { BaseEnv, getMemorizedStringOffsetToPos, matchResultToJson, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: getMemorizedStringOffsetToPos(),
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

describe("Test NoConsumeRefRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: "abc",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .noConsumeRef(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .noConsumeRef(r => r.seqEqual("abc"));
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: "abc",
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: "abc",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .noConsumeRef(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .noConsumeRef(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Fail case", () => {
        const offset = 0;
        const text = "xyzabcdefg";
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
            .noConsumeRef(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
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

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>")
            .noConsumeRef(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

});
