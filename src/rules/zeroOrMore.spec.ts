import { assert } from "chai";
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

describe("Test ZeroOrMoreRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 6,
            value: ["abc", "abc"] as string[],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
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
            .zeroOrMore(r => r.seqEqual("abc"));
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
            .zeroOrMore(r => r.seqEqual("abc"));
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

    it("Success case", () => {
        const offset = 0;
        const text = "xyz";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 0,
            value: [] as string[],
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .zeroOrMore(r => r.seqEqual("abc"));
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
