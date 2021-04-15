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
        const result = rule.match(pos, text, env);

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

        const result = rule.match(pos, text, env);

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
        const result = rule.match(pos, text, env);

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
        const result = rule.match(pos, text, env);

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
        const result = rule.match(pos, text, env);

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
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
