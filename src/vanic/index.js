import { diff } from "./diff.js";

let reRender;
let reElem;
let fno = {};
let rep = {};
let idx = 0;
let sid = 0;
let hooks = [];
let cleans = [];

const styleToString = (style) => {
  return Object.keys(style).reduce(
    (acc, key) =>
      acc +
      key
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      style[key] +
      ";",
    ""
  );
};

function _render(fn) {
  const res = fn();
  reRender = fn;
  const elem = document.createElement("div");
  elem.innerHTML = res;
  diff(elem, reElem);
  for (const k in fno) {
    const name = fno[k];
    for (const l in name) {
      const act = name[l];
      const $ = document.querySelector(`[_v${(typeof act)[0]}="${l}"]`);
      if (typeof act === "object") {
        for (const s in act) $[k.toLowerCase()][s] = act[s];
      } else $[k.toLowerCase()] = act;
    }
  }
  idx = 0;
  sid = 0;
  fno = {};
  return res;
}

export function useEffect(cb, deps) {
  if (!reElem) return;
  const id = sid;
  const old = hooks[id];
  const cc = old ? deps.some((dep, x) => !Object.is(dep, old[x])) : true;
  hooks[id] = deps;
  if (cleans[id]) {
    cleans[id]();
    cleans.splice(id, 1);
  }
  sid++;
  if (cc) {
    setTimeout(() => {
      const fn = cb();
      if (fn) cleans[id] = fn;
    });
  }
}

export function html(ret) {
  const subs = [].slice.call(arguments, 1);
  return ret.reduce((a, b, c) => {
    let val = subs[c - 1];
    if (val === null || val === undefined) val = "";
    const type = typeof val;
    if (type === "function" || type === "boolean" || type === "object") {
      const id = `${idx++}`;
      const arr = a.split(" ");
      const value = val;
      const attr = `_v${type[0]}="${id}`;
      const name = (arr[arr.length - 1] || "").replace(/=|"/g, "");
      fno[name] = fno[name] || {};
      fno[name][id] = value;
      if (type !== "function") rep[`${attr}"`] = [name, value];
      a = arr.slice(0, -1).join(" ") + ` ${attr}`;
      val = "";
    }
    return a + String(val) + b;
  });
}

export function useState(val) {
  const id = sid;
  sid++;
  return [
    hooks[id] === undefined ? val : hooks[id],
    (newVal) => {
      hooks[id] = newVal;
      if (reRender) _render(reRender);
    },
  ];
}

export function render(fn, elem) {
  reRender = undefined;
  reElem = undefined;
  fno = {};
  idx = 0;
  sid = 0;
  hooks = [];
  cleans = [];
  if (!elem) {
    return fn().replace(/ _v[o|f|b]="\d+"/g, (a) => {
      const arr = rep[a.substring(1)];
      if (arr === undefined) return "";
      const type = typeof arr[1];
      if (type === "object") return ` ${arr[0]}="${styleToString(arr[1])}"`;
      if (type === "boolean" && arr[1] === true) return ` ${arr[0]}`;
      return "";
    });
  }
  reElem = elem;
  return _render(fn);
}

// CREDIT & ORIGINAL https://github.com/developit/vhtml
// Add event onclick, onchange etc. and support style object.
const emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];
const esc = (str) => String(str).replace(/[&<>"']/g, (s) => `&${map[s]};`);
const map = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos" };
const setInnerHTMLAttr = "dangerouslySetInnerHTML";
const DOMAttributeNames = {
  className: "class",
  htmlFor: "for",
};
const sanitized = {};
export function h(name, attrs) {
  const stack = [];
  let s = "";
  attrs = attrs || {};
  for (let i = arguments.length; i-- > 2; ) {
    const arg = arguments[i];
    stack.push(typeof arg === "number" ? String(arg) : arg);
  }
  if (typeof name === "function") {
    attrs.children = stack.reverse();
    return name(attrs);
  }
  if (name) {
    s += "<" + name;
    if (attrs) {
      for (let i in attrs) {
        let val = attrs[i];
        const type = typeof val;
        if (type === "function" || type === "boolean" || type === "object") {
          const id = `${idx++}`;
          const value = val;
          const name = i;
          fno[name] = fno[name] || {};
          fno[name][id] = value;
          i = `_v${type[0]}`;
          val = id;
          if (type !== "function") rep[`${i}="${val}"`] = [name, value];
        }
        if (
          val !== false &&
          val !== null &&
          val !== undefined &&
          i !== setInnerHTMLAttr &&
          i !== ""
        ) {
          s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(
            val
          )}"`;
        }
      }
    }
    s += ">";
  }
  if (emptyTags.indexOf(name) === -1) {
    if (attrs[setInnerHTMLAttr]) {
      s += attrs[setInnerHTMLAttr].__html;
    } else {
      while (stack.length) {
        const child = stack.pop();
        if (child) {
          if (child.pop) {
            for (let i = child.length; i--; ) stack.push(child[i]);
          } else {
            s += sanitized[child] === true ? child : esc(child);
          }
        }
      }
    }
    s += name ? `</${name}>` : "";
  }
  sanitized[s] = true;
  return s;
}

export const Fragment = ({ children }) => h("", null, children);
