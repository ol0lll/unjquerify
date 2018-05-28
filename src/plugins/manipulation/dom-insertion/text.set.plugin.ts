import {
    assignmentExpression,
    Expression,
    identifier,
    isIdentifier,
    isMemberExpression,
    memberExpression,
} from "babel-types";
import {Plugin} from "../../../model/plugin";
import {jqueryApiReference, mdnReference, youDontNeedJquery} from "../../../util/references";

export const TextSetPlugin: Plugin = {
    name: "TextSetPlugin",
    references: [
        jqueryApiReference("text"),
        mdnReference("Node/textContent"),
        youDontNeedJquery("3.2"),
    ],
    fromExample: `$el.text("new text")`,
    toExample: `el.textContent = "new text"`,
    description: `Converts $el.text(...) calls.`,

    babel: () => ({
        visitor: {
            CallExpression: (path) => {
                const node = path.node;
                if (!isMemberExpression(node.callee)) return;
                if (!(isIdentifier(node.callee.property) && node.callee.property.name === "text")) return;
                if (node.arguments.length !== 1) return;
                const firstArg = node.arguments[0] as Expression;

                const el = memberExpression(node.callee.object, identifier("0"), true); // pull out of jquery;
                const textContent = memberExpression(el, identifier("textContent"));
                const assignment = assignmentExpression("=", textContent, firstArg);
                path.replaceWith(assignment);
            },
        },
    }),
};
