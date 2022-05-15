import * as gp from "./main";
import { assert } from "chai";

describe("Test main", () => {

    it("Success case", () => {

        const makeEnv = () => gp.makeStringEnv();
        const factory = new gp.RuleFactory<string, ReturnType<typeof makeEnv>>();
        const rule = factory
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.seqEqual("abc"))
                    .and(r => r.seqEqual("def"))
                )
                .or(r => r.seqEqual("xyz"))
            );
        const result = rule.match(0, "abcdef", makeEnv());
        assert.isTrue(result.ok);
    });

    it("Success case", () => {

        const makeEnv = () => gp.makeEnv<number[]>();
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
    });

});
