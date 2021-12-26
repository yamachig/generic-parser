import { assert } from "chai";
import { BaseEnv, MatchResult, stringOffsetToPos, StringPos } from "../core";
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

describe("Test RegExpObjRule", () => {

    it("Success case", () => {
        const regExp = /^a.c.e/;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const offset = 0;
        const expected = {
            ok: true,
            nextOffset: 5,
            env,
        } as const;
        const expectedMatchedString = "abcde";

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.strictEqual(result.value[0], expectedMatchedString);
    });

    it("Success case", () => {
        const regExp = /a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const offset = 3;
        const expected = {
            ok: true,
            nextOffset: 8,
            env,
        } as const;
        const expectedMatchedString = "abcde";

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.strictEqual(result.value[0], expectedMatchedString);
    });

    it("Fail case", () => {
        const regExp = /^a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const offset = 0;
        const expected = {
            ok: false,
            offset,
            expected: "/^a.c.e/",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const regExp = /^a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const offset = 0;
        const expected = {
            ok: false,
            offset,
            expected: "<a.c.e rule>",
            stack: "<stack>",
            prevFail: null,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .withName("<a.c.e rule>")
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
