import { diff } from "./diff.js";

let reRender;
let reElem;
let fno = [];
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
  let i = fno.length;
  while (i--) {
    const { key, value } = fno[i];
    const $ = document.querySelector(`[c-${(typeof value)[0]}="${i}"]`);
    if ($) {
      if (typeof value === "object") {
        for (const s in value) $[key.toLowerCase()][s] = value[s];
      } else {
        $[key.toLowerCase()] = value;
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
  return ret.reduce((start, end, no) => {
    let val = subs[no - 1];
    if (val === null || val === undefined) val = "";
    if (Array.isArray(val)) val = val.join("");
    const type = typeof val;
    if (type === "function" || type === "boolean" || type === "object") {
      const id = `${idx++}`;
      const arr = start.match(/[^ ]+/g);
      const value = val;
      const key = (arr[arr.length - 1] || "").replace(/=|"/g, "");
      const attr = `c-${type[0]}="${id}`;
      fno[id] = { key, value };
      if (type !== "function") rep[`${attr}"`] = { key, value };
      start = arr.slice(0, -1).join(" ") + ` ${attr}`;
      val = "";
    }
    return start + String(val) + end;
  });
}

export function useState(val) {
  const id = sid;
  sid++;
  const def = hooks[id] === undefined ? val : hooks[id];
  return [
    def,
    (newVal) => {
      hooks[id] = typeof newVal === "function" ? newVal(def) : newVal;
      _render(reRender);
    },
  ];
}

export function renderToString(fn) {
  return (typeof fn === "string" ? fn : fn()).replace(
    / c-[o|f|b]="\d+"/g,
    (a) => {
      const obj = rep[a.substring(1)];
      if (obj === undefined) return "";
      const { key, value } = obj;
      const type = typeof value;
      if (type === "object") return ` ${key}="${styleToString(value)}"`;
      if (value === true) return ` ${key}`;
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
