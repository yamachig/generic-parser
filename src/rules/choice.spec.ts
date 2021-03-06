import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, getMemorizedStringOffsetToPos, StringPos, MatchFailJson, matchResultToJson } from "../core";
import { SeqEqualRule } from "./seqEqual";
import { RuleFactory } from "./factory";
import { ChoiceRule } from "./choice";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: getMemorizedStringOffsetToPos(),
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
    baseOffset: 0,
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test ChoiceRule", () => {

    it("Success case", () => {
        const rule0 = new ChoiceRule(
            [],
            new RuleFactory<string, DummyStringEnv>(),
            null
        )
            .or(r => r.seqEqual("def"));
        const res0 = rule0.match(0, "abc", getDummyStringEnv());
        void res0;

        const rule1 = rule0
            .or(r => r
                .action(r => r
                    .sequence(s => s
                        .and(r => r.seqEqual("abc"), "a")
                    ), (
                    ({ a }) => {
                        return a.length;
                    }
                ))
            );
        const res1 = rule1.match(0, "abc", getDummyStringEnv());
        void res1;

        const rule2 = rule1
            .or(r => r
                .action(r => r
                    .sequence(s => s
                        .and(r => r.seqEqual("abc"), "b")
                    ), (
                    ({ b }) => {
                        return b.split("");
                    }
                ))
            );
        const res2 = rule2.match(0, "abc", getDummyStringEnv());
        void res2;
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .choice(c => c
                .or(r => r.seqEqual("def"))
                .or(r => r.seqEqual("abc"))
                .or(r => r.seqEqual("ghi"))
            );

        const result = rule.match(offset, text, env);

        assert.deepEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .choice(c => c
                .or(() => new SeqEqualRule("def"))
                .or(() => new SeqEqualRule("abc"))
                .or(() => new SeqEqualRule("ghi"))
            );

        const result = rule.match(offset, text, env);

        assert.deepEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: "abc",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .choice(choice => (choice
                .or(r => r.seqEqual("def"))
                .or(r => r.seqEqual("abc"))
                .or(r => r.seqEqual("ghi"))
            ));

        const result = rule.match(offset, text, env);

        assert.deepEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 6;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: "ghi",
            env,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .choice(c => c
                .or(r => r.seqEqual("def"))
                .or(r => r.seqEqual("abc"))
                .or(r => r.seqEqual("ghi"))
            );

        const result = rule.match(offset, text, env);

        assert.deepEqual(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 3,
            value: ["a", "b", "c"] as string[],
            env,
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .choice(c => c
                .or(r => r.seqEqual(["d", "e", "f"]))
                .or(r => r.seqEqual(["a", "b", "c"]))
                .or(r => r.seqEqual(["g", "h", "i"]))
            );

        const result = rule.match(offset, text, env);

        assert.deepEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 1;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 1,
            expected: "<def or abc or ghi>",
            prevFail: [
                {
                    ok: false,
                    offset: 1,
                    expected: "\"def\"",
                    prevFail: null,
                },
                {
                    ok: false,
                    offset: 1,
                    expected: "\"abc\"",
                    prevFail: null,
                },
                {
                    ok: false,
                    offset: 1,
                    expected: "\"ghi\"",
                    prevFail: null,
                },
            ] as MatchFailJson[],
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<def or abc or ghi>")
            .choice(c => c
                .or(r => r.seqEqual("def"))
                .or(r => r.seqEqual("abc"))
                .or(r => r.seqEqual("ghi"))
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Fail case", () => {
        const offset = 1;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 1,
            expected: "\"def\" / \"abc\" / \"ghi\"",
            prevFail: [
                {
                    ok: false,
                    offset: 1,
                    expected: "\"def\"",
                    prevFail: null,
                },
                {
                    ok: false,
                    offset: 1,
                    expected: "\"abc\"",
                    prevFail: null,
                },
                {
                    ok: false,
                    offset: 1,
                    expected: "\"ghi\"",
                    prevFail: null,
                },
            ] as MatchFailJson[],
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .choice(c => c
                .or(r => r.seqEqual("def"))
                .or(r => r.seqEqual("abc"))
                .or(r => r.seqEqual("ghi"))
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

    it("Fail case", () => {
        const offset = 1;
        const text = "abcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 1,
            expected: "<def or abc or ghi>",
            prevFail: [
                {
                    ok: false,
                    offset: 1,
                    expected: "\"def\"",
                    prevFail: null,
                },
                {
                    ok: false,
                    offset: 1,
                    expected: "\"abc\"",
                    prevFail: null,
                },
                {
                    ok: false,
                    offset: 1,
                    expected: "\"ghi\"",
                    prevFail: null,
                },
            ] as MatchFailJson[],
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>("<def or abc or ghi>")
            .choice(c => c
                .or(r => r.seqEqual("def"))
                .or(r => r.seqEqual("abc"))
                .or(r => r.seqEqual("ghi"))
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(matchResultToJson(result, { fullToString: true }), expected);
    });

});
