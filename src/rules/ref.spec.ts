import { assert } from "chai";
import { BaseEnv, stringOffsetToPos, StringPos } from "../core";
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

describe("Test RefRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
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
            .ref(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 0;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "\"abc\"",
            stack: "<stack>",
            prevFail: {
                ok: false,
                offset: 0,
                expected: "\"abc\"",
                stack: "<stack>",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .ref(r => r.seqEqual("abc"));
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
            stack: "<stack>",
            prevFail: {
                ok: false,
                offset: 0,
                expected: "\"abc\"",
                stack: "<stack>",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc rule>")
            .ref(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
