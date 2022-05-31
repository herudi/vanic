import { diff } from "./diff.js";

let reRender;
let reElem;
let fno = [];
let rep = {};
let idx = 0;
let sid = 0;
let hooks = [];
let cleans = [];
const warnHTML = "dangerouslySetInnerHTML";
function esc(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  let i = fno.length;
  while (i--) {
    const { k, v } = fno[i];
    const $ = document.querySelector(`[_v${(typeof v)[0]}="${i}"]`);
    if ($) {
      if (typeof v === "object") {
        for (const s in v) $[k.toLowerCase()][s] = v[s];
      } else {
        $[k.toLowerCase()] = v;
      }
    }
  }
  idx = 0;
  sid = 0;
  fno = [];
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
      fno[id] = { k: name, v: value };
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

export function renderToString(fn) {
  return (typeof fn === "string" ? fn : fn()).replace(
    / _v[o|f|b]="\d+"/g,
    (a) => {
      const arr = rep[a.substring(1)];
      if (arr === undefined) return "";
      const type = typeof arr[1];
      if (type === "object") return ` ${arr[0]}="${styleToString(arr[1])}"`;
      if (type === "boolean" && arr[1] === true) return ` ${arr[0]}`;
      return "";
    }
  );
}

export function render(fn, elem) {
  reRender = undefined;
  reElem = undefined;
  fno = [];
  idx = 0;
  sid = 0;
  hooks = [];
  cleans = [];
  reElem = elem;
  _render(fn);
}

export function h(tag, attr) {
  const args = [].slice.call(arguments, 2);
  const arr = [];
  let str = "";
  let len = args.length;
  attr = attr || {};
  while (len--) {
    const arg = args[len];
    arr.push(typeof arg === "number" ? String(arg) : arg);
  }
  if (typeof tag === "function") {
    attr.children = arr.reverse();
    return tag(attr);
  }
  if (tag) {
    str += `<${tag}`;
    if (attr) {
      for (let k in attr) {
        let val = attr[k];
        const type = typeof val;
        if (type === "function" || type === "boolean" || type === "object") {
          const id = `${idx++}`;
          const value = val;
          const name = k;
          fno[id] = { k: name, v: value };
          k = `_v${type[0]}`;
          val = id;
          if (type !== "function") rep[`${k}="${val}"`] = [name, value];
        }
        if (
          val !== undefined &&
          val !== false &&
          val !== null &&
          k !== warnHTML &&
          k !== ""
        ) {
          str += ` ${k}="${val}"`;
        }
      }
    }
    str += ">";
  }
  if (
    [
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
    ].indexOf(tag) === -1
  ) {
    if (attr[warnHTML]) {
      str += attr[warnHTML].__html;
    } else {
      while (arr.length) {
        const child = arr.pop();
        if (child) {
          if (child.pop) {
            for (let i = child.length; i--; ) arr.push(child[i]);
          } else {
            str += child[0] !== "<" ? esc(child) : child;
          }
        }
      }
    }
    str += tag ? `</${tag}>` : "";
  }
  return str;
}

export const Fragment = ({ children }) => h("", null, children);
