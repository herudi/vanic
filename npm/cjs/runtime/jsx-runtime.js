var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var jsx_runtime_exports = {};
__export(jsx_runtime_exports, {
  Fragment: () => import__.Fragment,
  jsx: () => createElem,
  jsxDev: () => createElem,
  jsxs: () => createElem
});
module.exports = __toCommonJS(jsx_runtime_exports);
var import__ = require("../index.js");
const createElem = (type, props) => {
  const { children = [], ...rest } = props || {};
  const arr = children.pop ? children : [children];
  return (0, import__.h)(type, rest, ...arr);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Fragment,
  jsx,
  jsxDev,
  jsxs
});
