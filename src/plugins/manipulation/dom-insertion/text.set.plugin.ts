import {assignmentExpression, Expression, identifier, memberExpression} from "babel-types";
import {Plugin} from "../../../model/plugin";
import {jqueryApiReference, mdnReference, youDontNeedJquery} from "../../../util/references";
import {isCallOnjQuery} from "../../../util/jquery-heuristics";
import {CallExpressionOfjQueryCollection} from "../../../model/call-expression-of-jquery-collection";

export const TextSetPlugin: Plugin = {
    name: "TextSetPlugin",
    path: ["manipulation", "dom-insertion", "text.set"],
    causesChainMutation: false,
    matchesExpressionType: new CallExpressionOfjQueryCollection("text"),
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
                if (!isCallOnjQuery(node, "text")) return;

                if (node.arguments.length !== 1) return;
                const firstArg = node.arguments[0] as Expression;

                const el = node.callee.object;
                const textContent = memberExpression(el, identifier("textContent"));
                const assignment = assignmentExpression("=", textContent, firstArg);
                path.replaceWith(assignment);
            },
        },
    }),
};
