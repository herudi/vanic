import { Fragment, h } from "../index.js";

const createElem = (type, props) => {
  const { children = [], ...rest } = props || {};
  const arr = children.pop ? children : [children];
  return h(type, rest, ...arr);
};
export { Fragment };
export { createElem as jsx };
export { createElem as jsxs };
export { createElem as jsxDev };
