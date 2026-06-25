export type ComparatorFunc = (a: number | string, b: number | string) => boolean;
export const simpleComparators = {
    $gt: function (a: number, b: number) {
        return a > b;
    },
    $gte: function (a: number, b: number) {
        return a >= b;
    },
    $lt: function (a: number, b: number) {
        return a < b;
    },
    $lte: function (a: number, b: number) {
        return a <= b;
    },
    $eq: function (a: number, b: number) {
        return a === b;
    },
    $ne: function (a: number, b: number) {
        return a !== b;
    },

    $in: function (docVal: string, operand: string) {
        if (Array.isArray(docVal)) {
            return docVal.some(function (val) {
                return operand.indexOf(val) !== -1;
            });
        } else {
            return operand.indexOf(docVal) !== -1;
        }
    },
    $nin: function (docVal: string, operand: string) {
        if (Array.isArray(docVal)) {
            return docVal.every(function (val) {
                return operand.indexOf(val) === -1;
            });
        } else {
            return operand.indexOf(docVal) === -1;
        }
    },
    $all: function (docVal: string[], operand: string) {
        return (
            docVal instanceof Array &&
            docVal.reduce(function (last, cur) {
                return last && operand.indexOf(cur) !== -1;
            }, true)
        );
    },
};

export const symbolComparator: { [key: string]: string } = {
    $eq: "==",
    $ne: "!=",
    $gt: ">",
    $gte: ">=",
    $lt: "<",
    $lte: "<=",
    $in: "==",
    $nin: "nin",
};
