import * as babel from "babel-core";
import {
    callExpression,
    identifier,
    isIdentifier,
    isMemberExpression,
    isStringLiteral,
    memberExpression,
    nullLiteral,
    stringLiteral,
} from "babel-types";
import {Plugin} from "../../../model/plugin";
import {jqueryApiReference, mdnReference, youDontNeedJquery} from "../../../util/references";

export const CssGetPlugin: Plugin = {
    name: "CssGetPlugin",
    references: [
        jqueryApiReference("css"),
        mdnReference("Window/getComputedStyle"),
        youDontNeedJquery("2.1"),
    ],
    fromExample: `$el.css("background-color")`,
    toExample: `getComputedStyle(el, null)["background-color"]`,
    description: `Converts css get calls.`,
    babel: () => ({
        visitor: {
            CallExpression: (path) => {
                const node = path.node;
                if (!isMemberExpression(node.callee)) return;
                if (!(isIdentifier(node.callee.property) && node.callee.property.name === "css")) return;
                if (node.arguments.length !== 1) return;
                const el = memberExpression(node.callee.object, identifier("0"), true); // pull out of jquery;

                const getComputedStyle = identifier("getComputedStyle");
                const computedStyle = callExpression(getComputedStyle, [el, nullLiteral()]);
                const arg = node.arguments[0];
                if (!isStringLiteral(arg)) return; // TODO fix for array type
                const styleIdValue = arg.value;
                const styleIdentifier = stringLiteral(styleIdValue);
                const property = memberExpression(computedStyle, styleIdentifier, true);
                path.replaceWith(property);
            },
        } as babel.Visitor<{}>,
    }),
};
