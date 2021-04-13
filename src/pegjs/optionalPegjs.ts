import peg from "./pegjsTypings/pegjs";

export const pegjs = (() => {
    try {
        return require("pegjs-dev/packages/pegjs");
    } catch {
        return null;
    }
})() as (null | typeof peg);

export default pegjs;
