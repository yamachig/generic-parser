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

describe("Test NextIsNotRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot((r => r.seqEqual("abc")));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot(() => insideRule);
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const offset = 0;
        const text = "xyz";
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
        const offset = 1;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: undefined,
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot((r => r.seqEqual("abc")));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "!(\"abc\")",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory()
            .nextIsNot(() => insideRule);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const insideRule = new SeqEqualRule<string, string, DummyStringEnv>("abc");
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "!(\"abc\")",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .nextIsNot(() => insideRule);
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "<not abc rule>",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<not abc rule>")
            .nextIsNot(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
