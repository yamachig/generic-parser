import { BaseEnv, BasePos } from "../../core";
import { RuleFactory } from "../factory";
import { RegExpRule } from "./regExp";
import { RegExpObjRule } from "./regExpObj";

export class StringRuleFactory<
    TPrevEnv extends BaseEnv<string, BasePos> = BaseEnv<string, BasePos>,
> extends RuleFactory<string, TPrevEnv> {

    public withName(name: string): this {
        return new StringRuleFactory<TPrevEnv>(name) as this;
    }

    public regExp(
        regExp: RegExp,
    ):
        RegExpRule<
            TPrevEnv
        >
    {
        return new RegExpRule(
            regExp,
            this.name,
        );
    }

    public regExpObj(
        regExp: RegExp,
    ):
        RegExpObjRule<
            TPrevEnv
        >
    {
        return new RegExpObjRule(
            regExp,
            this.name,
        );
    }
}
