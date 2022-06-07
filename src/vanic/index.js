import { diff } from "./diff.js";

let reRender;
let reElem;
let fno = [];
let rep = {};
let idx = 0;

// hook var
let hid = 0;
let states = [];
let cleans = [];
let mems = [];

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

export function _render(fn) {
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
  hid = 0;
  idx = 0;
  fno = [];
}

export function html(ret) {
  const subs = [].slice.call(arguments, 1);
  return ret.reduce((start, end, no) => {
    let val = subs[no - 1];
    if (val === null || val === undefined) val = "";
    if (Array.isArray(val)) val = val.join("");
    const type = typeof val;
    if (type === "function" || type === "boolean" || type === "object") {
      const arr = start.match(/[^ ]+/g);
      const value = val;
      const key = (arr[arr.length - 1] || "").replace(/=|"/g, "");
      const id = idx;
      const attr = `c-${type[0]}="${id}`;
      fno[id] = { key, value };
      if (type !== "function") rep[`${attr}"`] = { key, value };
      start = arr.slice(0, -1).join(" ") + ` ${attr}`;
      val = "";
      idx++;
    }
    return start + String(val) + end;
  });
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
  fno = [];
  idx = 0;
  reElem = elem;
  hid = 0;
  states = [];
  cleans = [];
  mems = [];
  _render(fn);
}

function hasChange(id, deps) {
  const hook = states[id];
  const cc = hook ? deps.some((dep, x) => !Object.is(dep, hook[x])) : true;
  states[id] = deps;
  return cc;
}

// useState
export function useState(val) {
  const id = hid;
  hid++;
  const def = states[id] === undefined ? val : states[id];
  return [
    def,
    (newVal) => {
      states[id] = typeof newVal === "function" ? newVal(def) : newVal;
      _render(reRender);
    },
  ];
}

// useEffect
export function useEffect(cb, deps) {
  if (!reElem) return;
  const id = hid;
  const cc = hasChange(id, deps);
  if (cleans[id]) {
    cleans[id]();
    cleans.splice(id, 1);
  }
  hid++;
  if (cc) {
    setTimeout(() => {
      const fn = cb();
      if (fn) cleans[id] = fn;
    });
  }
}

// useReducer
export function useReducer(reducer, init, initLazy) {
  const arr = useState(initLazy !== undefined ? initLazy(init) : init);
  return [
    arr[0],
    (action) => {
      arr[1](reducer(arr[0], action));
    },
  ];
}

// useMemo
export function useMemo(fn, deps) {
  if (!reElem) return fn();
  const id = hid;
  const cc = hasChange(id, deps);
  if (cc) mems[id] = fn();
  hid++;
  return mems[id] || fn();
}

// useCallback
export const useCallback = (cb, deps) => useMemo(() => (p) => cb(p), deps);

// useRef
export const useRef = (current) => useMemo(() => ({ current }), []);

// createContext
export const createContext = (init) => {
  return {
    val: undefined,
    Provider(value, fn) {
      this.val = value || init;
      return fn();
    },
    v() {
      return this.val;
    },
  };
};

// useContext
export const useContext = (ctx) => {
  return ctx.v();
};
