import * as gp from "./main";
import { assert } from "chai";

describe("Test main", () => {

    it("Success case", () => {

        const makeEnv = () => gp.makeStringEnv({ additional: "add" });
        const factory = new gp.RuleFactory<string, ReturnType<typeof makeEnv>>();
        const rule = factory
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.seqEqual("abc"), "part1")
                    .and(r => r.seqEqual("def"))
                    .action(({ part1, additional }) => {
                        return part1.toUpperCase() + additional;
                        // Type-aware! `part1` is recognized as an `string`.
                    })
                )
                .or(r => r.seqEqual("xyz"))
            );
        const result = rule.match(0, "abcdef", makeEnv());
        assert.isTrue(result.ok);
        if (result.ok) assert.deepStrictEqual(result.value, "ABCadd");
    });

    it("Success case", () => {

        const makeEnv = () => gp.makeEnv<number[]>()();
        const factory = new gp.RuleFactory<number[], ReturnType<typeof makeEnv>>();
        const rule = factory
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.seqEqual([0xAB, 0xCD]), "part2")
                    .and(r => r.seqEqual([0xEF]))
                    .action(({ part2 }) => {
                        return part2[0];
                        // Type-aware! `part2` is recognized as an `Array<number>`.
                    })
                )
                .or(r => r.seqEqual([0x00]))
            );
        const result = rule.match(0, [0xAB, 0xCD, 0xEF], makeEnv());
        assert.isTrue(result.ok);
        if (result.ok) assert.deepStrictEqual(result.value, 0xAB);
    });

    it("Success case", () => {

        const makeEnv = () => gp.makeEnv<number[]>()();
        const factory = new gp.RuleFactory<number[], ReturnType<typeof makeEnv>>();
        const rule = factory
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.seqEqual([0xAB, 0xCD]), "part2")
                    .and(r => r.seqEqual([0xEF]))
                    .action(({ part2 }) => {
                        return part2[0].toString(16).toUpperCase();
                        // Type-aware! `part2` is recognized as an `Array<number>`.
                    })
                )
                .or(r => r.seqEqual([0x00]))
            );
        const result = rule.match(0, [0xAB, 0xCD, 0xEF], makeEnv());
        assert.isTrue(result.ok);
        if (result.ok) assert.deepStrictEqual(result.value, "AB");
    });

    it("Success case", () => {

        const makeEnv = () => gp.makeEnv<number[]>()({
            add1: "add1",
            offsetToPos: (_target, offset) => ({ offset, add2: "add2" }),
        });
        const factory = new gp.RuleFactory<number[], ReturnType<typeof makeEnv>>();
        const rule = factory
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.seqEqual([0xAB, 0xCD]), "part2")
                    .and(r => r.seqEqual([0xEF]))
                    .action(({ part2, add1, location }) => {
                        const add2 = location().start.add2;
                        return part2[0].toString(16).toUpperCase() + add1 + add2;
                        // Type-aware! `part2` is recognized as an `Array<number>`.
                    })
                )
                .or(r => r.seqEqual([0x00]))
            );
        const result = rule.match(0, [0xAB, 0xCD, 0xEF], makeEnv());
        assert.isTrue(result.ok);
        if (result.ok) assert.deepStrictEqual(result.value, "ABadd1add2");
    });

});
