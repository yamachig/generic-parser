import { assert } from "chai";
import { SeqEqualRule } from "./seqEqual";
import { BaseEnv, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    getStack: () => "<stack>",
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

describe("Test OneOrMoreRule", () => {

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOrMore(() => insideRule);
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["abc", "abc"] as string[],
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOrMore(r => r.seqEqual("abc"));
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["abc", "abc"] as string[],
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOrMore(r => r.seqEqual("abc"));
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["abc", "abc"] as string[],
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOrMore(r => r.seqEqual("abc"));
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["abc"] as string[],
            env,
        } as const;

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .oneOrMore(r => r.seqEqual("abc"));
        const offset = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "(\"abc\")+",
            stack: "<stack>",
            prevFail: {
                ok: false,
                offset: 0,
                expected: "\"abc\"",
                stack: "<stack>",
                prevFail: null,
            },
        } as const;

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
            expected: "<abc+ rule>",
            stack: "<stack>",
            prevFail: {
                ok: false,
                offset: 0,
                expected: "\"abc\"",
                stack: "<stack>",
                prevFail: null,
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<abc+ rule>")
            .oneOrMore(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
