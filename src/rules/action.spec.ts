import { assert } from "chai";
import { arrayLikeOffsetToPos, BaseEnv, BasePos, Location, MatchResult, stringOffsetToPos, StringPos } from "../core";
import { RuleFactory } from "./factory";

const dummyStringSymbol = Symbol("dummyStringSymbol");
const getDummyStringEnv = (): BaseEnv<string, StringPos> & {[dummyStringSymbol]: "dummy"} => ({
    [dummyStringSymbol]: "dummy",
    offsetToPos: stringOffsetToPos,
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringEnv = ReturnType<typeof getDummyStringEnv>;

const dummyStringArraySymbol = Symbol("dummyStringArraySymbol");
const getDummyStringArrayEnv = (): BaseEnv<string[], BasePos> & {[dummyStringArraySymbol]: "dummy"} => ({
    [dummyStringArraySymbol]: "dummy",
    offsetToPos: arrayLikeOffsetToPos,
    toStringOptions: { fullToString: true },
    registerCurrentRangeTarget: () => { /**/ },
    options: {},
});
type DummyStringArrayEnv = ReturnType<typeof getDummyStringArrayEnv>;

describe("Test ActionRule", () => {

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 6,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => {
                const ret = r
                    .sequence(s => s
                        .and(r => r.seqEqual("abc"), "a")
                        .and(r => r.seqEqual("abc"))
                        .and(r => r.seqEqual("abc"), "b")
                    );
                return ret;
            }, (
                ({ a, b }) => {
                    return a.length + b.length;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 15,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => {
                const ret = r
                    .sequence(s => s
                        .and(r => r.seqEqual("abc"), "a")
                        .and(r => r.seqEqual("abc"))
                        .and(r => r.seqEqual("abc"), "b")
                    );
                return ret;
            }, (
                ({ a, b, text }) => {
                    return a.length + b.length + text().length;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 6,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => {
                const ret = r
                    .sequence(s => s
                        .and(r => r.seqEqual("abc"), "a")
                        .and(r => r.seqEqual("abc"))
                        .and(r => r.seqEqual("abc"), "text")
                    );
                return ret;
            }, (
                ({ a, text }) => {
                    return a.length + text.length;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        const offset = 5;
        const text = "xyz\r\nabcdefghi";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 14,
            value: {
                location: {
                    start: {
                        offset: 5,
                        line: 2,
                        column: 1,
                    },
                    end: {
                        offset: 14,
                        line: 2,
                        column: 10,
                    },
                },
                text: "abcdefghi",
            },
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "ghi",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(r => r.seqEqual("abc"), "a")
                .and(r => r.seqEqual("def"))
                .and(r => r.seqEqual("ghi"), "b")
                .action(({ location, text }) => {
                    return {
                        location: location(),
                        text: text(),
                    };
                })
            );

        const result: MatchResult<
            {
                location: Location<StringPos>,
                text: string,
            },
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 6,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return a.length + b.length;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(s => s.seqEqual("abc"), "a")
                .and(s => s.seqEqual("abc"))
                .and(s => s.seqEqual("abc"), "b")
                .action(({ a, b }) => {
                    return a.length + b.length;
                })
            );

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 6,
        } as const;
        const expectedEnv = {
            a: "abc",
            b: "abc",
        };

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(s => s.seqEqual("abc"), "a")
                .and(s => s.seqEqual("abc"))
                .and(s => s.seqEqual("abc"), "b")
                .action(({ a, b }) => {
                    return a.length + b.length;
                })
            );

        const result: MatchResult<
            number,
            DummyStringEnv & {
                a: string;
                b: string;
            }
        > = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
        if (result.ok) assert.deepInclude(result.env, expectedEnv);
    });

    it("Success case", () => {
        const offset = 0;
        const text = "abcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: 6,
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return a.length + b.length;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        const offset = 0;
        const text = ["a", "b", "c", "a", "b", "c", "a", "b", "c"];
        const env = getDummyStringArrayEnv();
        const expected = {
            ok: true,
            nextOffset: 9,
            value: ["a,b,c", "a,b,c"],
        } as const;

        const rule = new RuleFactory<string[], DummyStringArrayEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual(["a", "b", "c"]), "a")
                    .and(s => s.seqEqual(["a", "b", "c"]))
                    .and(s => s.seqEqual(["a", "b", "c"]), "b")
                ), (
                ({ a, b }) => {
                    return [a.join(","), b.join(",")] as const;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Success case", () => {
        const offset = 3;
        const text = "xyzabcabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: true,
            nextOffset: 12,
            value: ["a", "b", "c", "a", "b", "c"],
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return [...a.split(""), ...b.split("")] as const;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepInclude(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "(\"abc\" \"abc\" \"abc\"){<action>}",
            prevFail: {
                ok: false,
                offset: 3,
                expected: "\"abc\" \"abc\" \"abc\"",
                prevFail: {
                    ok: false,
                    offset: 9,
                    expected: "\"abc\"",
                    prevFail: null,
                },
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return [...a.split(""), ...b.split("")] as const;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Fail case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expected = {
            ok: false,
            offset: 3,
            expected: "<abc rule>",
            prevFail: {
                ok: false,
                offset: 3,
                expected: "\"abc\" \"abc\" \"abc\"",
                prevFail: {
                    ok: false,
                    offset: 9,
                    expected: "\"abc\"",
                    prevFail: null,
                },
            },
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .withName("<abc rule>")
            .action(r => r
                .sequence(s => s
                    .and(s => s.seqEqual("abc"), "a")
                    .and(s => s.seqEqual("abc"))
                    .and(s => s.seqEqual("abc"), "b")
                ), (
                ({ a, b }) => {
                    return [...a.split(""), ...b.split("")] as const;
                }
            ));

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

    it("Catched success case", () => {
        const offset = 3;
        const text = "xyzabcabc";
        const env = getDummyStringEnv();
        const expectedFail = {
            ok: false,
            offset: 3,
            expected: "\"abc\" \"abc\" \"abc\"",
            prevFail: {
                ok: false,
                offset: 9,
                expected: "\"abc\"",
                prevFail: null,
            },
        } as const;
        const expected = {
            ok: true,
            nextOffset: 9,
            value: ["f", "a", "i", "l"],
            env: {
                ...env,
                a: "failed_a",
                b: "failed_b",
            }
        } as const;

        const rule = new RuleFactory<string, DummyStringEnv>()
            .sequence(s => s
                .and(s => s.seqEqual("abc"), "a")
                .and(s => s.seqEqual("abc"))
                .and(s => s.seqEqual("abc"), "b")
                .action(
                    ({ a, b }) => {
                        return [...a.split(""), ...b.split("")] as const;
                    },
                    ({ result, prevEnv, range }) => {
                        assert.deepStrictEqual(result, expectedFail);
                        const [, end] = range();
                        return {
                            ok: true,
                            nextOffset: end,
                            value: ["f", "a", "i", "l"],
                            env: {
                                ...prevEnv,
                                a: "failed_a",
                                b: "failed_b",
                            },
                        };
                    }
                )
            );

        const result = rule.match(offset, text, env);

        assert.deepStrictEqual(result, expected);
    });

});
