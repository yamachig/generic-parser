import { assert } from "chai";
import { BaseEnv, MatchResult } from "../core";
import { RuleFactory } from "./factory";
import { stringOffsetToPos, StringPos } from "./string/env";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

// const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
// const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
//     [dummyStringArraySymbol]: "dummy",
//     offsetToPos: arrayLikeOffsetToPos,
// });
// type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test AnyOneRule", () => {

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 0;
        const text = "abcabcg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 1,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.anyOne())
            );
        const result: MatchResult<string, DummyStringEnv> = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Success case", () => {
        const pos = 3;
        const text = "xyzabcdefg";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextPos: 4,
            value: "a",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: ".",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 3;
        const text = "abc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 3,
            expected: ".",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .anyOne();
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const pos = 0;
        const text = "";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            pos: 0,
            expected: "<any one rule>",
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<any one rule>")
            .anyOne();
        const result = rule.match(pos, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
