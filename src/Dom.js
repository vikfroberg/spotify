import Dict from "./Dict";
import IO from "./IO";
import * as R from "ramda";
import { pipe } from "./Utils";
import { patch } from "./Patchable";
import { List } from "./List";

export const Context = node => ({
  node,
  append: el => {
    if (el) {
      node.appendChild(el);
      return Context(el);
    } else {
      return Context(node);
    }
  },
  get: id => {
    return Context(node.childNodes[id]);
  },
  replace: (id, el) => {
    if (el) {
      node.replaceChild(el, node.childNodes[id]);
      return Context(el);
    } else {
      return Context(node);
    }
  },
  destroy: id => {
    const data = node.childNodes[id];
    node.removeChild(node.childNodes[id]);
    return Context(data);
  },
});

const styleElement = document.createElement("style");
document.head.appendChild(styleElement);
const styleSheet = styleElement.sheet;

let count = 0;
export const StyleProp = (name, val) => {
  const className = "a" + count++;
  return {
    type: "attribute",
    name,
    val,
    className,
    isEqual: element =>
      element.type === "attribute" &&
      element.name === name &&
      element.val === val,
    // update: (context, oldElement, index) => {
    //   context.node.setAttribute(name, val);
    // },
    // replace: (context, oldElement, index) => {
    //   context.node.removeAttribute(oldElement.name);
    //   context.node.setAttribute(name, val);
    // },
    append: (context, index) => {
      styleSheet.insertRule(
        "." + className + "{" + name + ":" + val + ";}",
        index,
      );
      context.node.classList.add(className);
    },
    destroy: (context, index) => {
      styleSheet.deleteRule(index);
      context.node.classList.remove(className);
    },
  };
};

export const Attribute = (name, val) => {
  return {
    type: "attribute",
    name,
    val,
    isEqual: element => element.type === "attribute" && element.name === name,
    update: (context, oldElement, index) => {
      context.node.setAttribute(name, val);
    },
    replace: (context, oldElement, index) => {
      context.node.removeAttribute(oldElement.name);
      context.node.setAttribute(name, val);
    },
    append: context => {
      context.node.setAttribute(name, val);
    },
    destroy: (context, index) => {
      context.node.removeAttribute(name);
    },
  };
};

export const Element = (tag, _styles, _attributes, _children) => {
  const children = List(_children);
  const attributes = List(
    R.toPairs(_attributes).map(args => Attribute(...args)),
  );
  const styles = List(R.toPairs(_styles).map(args => StyleProp(...args)));
  return {
    type: "element",
    tag,
    children,
    attributes,
    styles,
    isEqual: element => element.type === "element" && element.tag === tag,
    update: (context, oldElement, index) => {
      patch(context, children, oldElement.children, index);
      patch(context, attributes, oldElement.attributes, index);
      patch(context, styles, oldElement.styles, index);
    },
    replace: (context, oldElement, index) => {
      context.replace(index, document.createElement(tag));
      patch(context, children);
      patch(context, attributes);
      patch(context, styles);
    },
    append: context => {
      const newContext = context.append(document.createElement(tag));
      patch(newContext, children);
      patch(newContext, attributes);
      patch(newContext, styles);
    },
    destroy: (context, index) => {
      context.destroy(index);
    },
  };
};

export const Text = str => ({
  type: "text",
  str,
  isEqual: text => text.type === "text" && text.str === str,
  update: () => {},
  replace: (context, oldText, index) => {
    context.replace(index, document.createTextNode(str));
  },
  append: context => {
    context.append(document.createTextNode(str));
  },
  destroy: (context, index) => {
    context.destroy(index);
  },
});

export const getHashParams = IO(res => {
  res(
    pipe(window.location.hash, [
      R.drop(1),
      R.split("&"),
      R.map(R.split("=")),
      R.fromPairs,
      Dict.from,
    ]),
  );
});
