import { BasePos } from "../common";

export interface StringPos extends BasePos {
    line: number; // 1-based
    column: number; // 1-based
}

export const stringOffsetToPos =
    (target: string, offset: number): StringPos => {
        const beforeStr = target.slice(0, offset);
        const lines = beforeStr.split(/\r?\n/g);
        return {
            offset,
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
        };
    };
