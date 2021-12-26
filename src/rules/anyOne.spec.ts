import { assert } from "chai";
import { BaseEnv, MatchResult, stringOffsetToPos, StringPos } from "../core";
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

describe("Test AnyOneRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.anyOne())
            );
        const result: MatchResult<string, DummyStringEnv> = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 4,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: ".",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "abc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: ".",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 0,
            expected: "<any one rule>",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<any one rule>")
            .anyOne();
        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
