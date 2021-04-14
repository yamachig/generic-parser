import { assert } from "chai";
import { BaseEnv, MatchResult, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

describe("Test RegExpObjRule", () => {

    it("Success case", () => {
        const regExp = /^a.c.e/;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const pos = 0;
        const expected = {
            ok: true,
            nextPos: 5,
            env,
        } as const;
        const expectedMatchedString = "abcde";

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.strictEqual(result.value[0], expectedMatchedString);
    });

    it("Success case", () => {
        const regExp = /a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const pos = 3;
        const expected = {
            ok: true,
            nextPos: 8,
            env,
        } as const;
        const expectedMatchedString = "abcde";

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.strictEqual(result.value[0], expectedMatchedString);
    });

    it("Fail case", () => {
        const regExp = /^a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const pos = 0;
        const expected = {
            ok: false,
            pos,
            expected: "/^a.c.e/",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepEqual(result, expected);
    });

    it("Fail case", () => {
        const regExp = /^a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const pos = 0;
        const expected = {
            ok: false,
            pos,
            expected: "<a.c.e rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .withName("<a.c.e rule>")
            .regExpObj(regExp);
        const result: MatchResult<RegExpExecArray, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepEqual(result, expected);
    });

});
