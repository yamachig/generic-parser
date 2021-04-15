import { assert } from "chai";
import { BaseEnv, MatchResult, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    registerCurrentLocation: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

describe("Test RegExpRule", () => {

    it("Success case", () => {
        const regExp = /^a.c.e/;
        const text = "abcdefg";
        const env = getDummyStringEnv();
        const pos = 0;
        const expected = {
            ok: true,
            nextPos: 5,
            value: "abcde",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .regExp(regExp);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const regExp = /a.c.e/;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const pos = 3;
        const expected = {
            ok: true,
            nextPos: 8,
            value: "abcde",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>().regExp(regExp);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
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

        const rule = new RuleFactory<string, DummyStringEnv>().regExp(regExp);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

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
            .regExp(regExp);
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepEqual(result, expected);
    });

});
