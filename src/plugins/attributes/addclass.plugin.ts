import {
    callExpression,
    identifier,
    isIdentifier,
    isMemberExpression,
    isStringLiteral,
    memberExpression,
    stringLiteral,
} from "babel-types";
import {Plugin} from "../../model/plugin";
import {jqueryApiReference, mdnReference, youDontNeedJquery} from "../../util/references";
import {pullOutNativeElement} from "../../util/jquery-heuristics";

export const AddClassPlugin: Plugin = {
    name: "AddClassPlugin",
    path: ["attributes", "addclass"],
    references: [
        jqueryApiReference("addClass"),
        mdnReference("Element/classList"),
        youDontNeedJquery("2.1"),
    ],
    fromExample: `$el.addClass("selected")`,
    toExample: `el.classList.add(className)`,
    description: `Converts $el.addClass calls.`,

    babel: () => ({
        visitor: {
            CallExpression: (path) => {
                const node = path.node;
                if (!isMemberExpression(node.callee)) return;
                if (!(isIdentifier(node.callee.property) && node.callee.property.name === "addClass")) return;
                if (node.arguments.length !== 1) return;
                const firstArg = node.arguments[0];
                if (!isStringLiteral(firstArg)) return;
                const el = pullOutNativeElement(node.callee.object);

                const classList = memberExpression(el, identifier("classList"));
                const add = memberExpression(classList, identifier("add"));
                const classes = firstArg.value.split(" ");
                const call = callExpression(add, classes.map(name => stringLiteral(name)));
                path.replaceWith(call);
            },
        },
    }),
};
