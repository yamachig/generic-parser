import peg from "./pegjsTypings/pegjs";

export const pegjs = (() => {
    try {
        return require("pegjs-dev/packages/pegjs");
    } catch {
        console.error("pegjs-dev not found. Please install it from https://github.com/pegjs/pegjs/tarball/b7b87ea8aeeaa1caf096e2da99fd95a971890ca1");
        return null;
    }
})() as (null | typeof peg);

export default pegjs;
