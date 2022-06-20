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

function esc(unsafe) {
  return String(unsafe)
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

export function _render(fn) {
  const res = fn();
  reRender = fn;
  const elem = document.createElement("div");
  elem.innerHTML = res;
  diff(elem, reElem);
  let i = fno.length;
  while (i--) {
    const obj = fno[i];
    const value = obj.value;
    const key = obj.key.toLowerCase();
    if (key !== "ref") {
      const $ = document.querySelector(`[c-${i}="${i}"]`);
      if ($) {
        if (typeof value === "object") {
          for (const s in value) $[key][s] = value[s];
        } else {
          $[key] = value;
        }
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
      const key = (arr[arr.length - 1] || "").replace(/=|"/g, "").toLowerCase();
      const id = idx++;
      const attr = `c-${id}="${id}`;
      if (key === "ref") {
        val.ref = () => document.querySelector(`[${attr}"]`);
      }
      fno[id] = { key, value };
      if (type !== "function") rep[`${attr}"`] = { key, value };
      start = arr.slice(0, -1).join(" ") + ` ${attr}`;
      val = "";
    }
    return start + String(val) + end;
  });
}

export function renderToString(fn) {
  return (typeof fn === "string" ? fn : fn()).replace(/ c-.*="\d+"/g, (a) => {
    const arr = (a || "").split(" ");
    let str = "";
    for (let i = 0; i < arr.length; i++) {
      const ret = rep[arr[i]];
      if (ret) {
        const { key, value } = ret;
        const type = typeof value;
        if (type === "object" && key !== "ref") {
          str += ` ${key}="${styleToString(value)}"`;
        }
        if (value === true) str += ` ${key}`;
      }
    }
    return str;
  });
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

export const useLayoutEffect = useEffect;

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
  return mems[id];
}

// useCallback
export const useCallback = (cb, deps) => useMemo(() => (p) => cb(p), deps);

// useRef
export const useRef = (current) =>
  useMemo(() => ({ current, ref: () => current }), []);

// createContext
export const createContext = (init) => {
  let value;
  return {
    Provider(newVal, fn) {
      value = newVal || init;
      return fn();
    },
    v: () => value,
  };
};

// useContext
export const useContext = (c) => {
  return c.v();
};

// CREDIT & ORIGINAL https://github.com/developit/vhtml
// Add event, ref and style as object.
const dangerHTML = "dangerouslySetInnerHTML";
export function h(tag, attr) {
  const args = [].slice.call(arguments, 2);
  const arr = [];
  let str = "";
  attr = attr || {};
  for (let i = args.length; i--; ) {
    arr.push(typeof args[i] === "number" ? String(args[i]) : args[i]);
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
          const id = idx++;
          const value = val;
          const key = k.toLowerCase();
          if (key === "ref") {
            val.ref = () => document.querySelector(`[c-${id}="${id}"]`);
          }
          fno[id] = { key, value };
          k = `c-${id}`;
          val = id;
          if (type !== "function") rep[`${k}="${val}"`] = { key, value };
        }
        if (
          val !== undefined &&
          val !== false &&
          val !== null &&
          k !== dangerHTML
        ) {
          str += ` ${k}="${esc(val)}"`;
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
    if (attr[dangerHTML]) {
      str += attr[dangerHTML].__html;
    } else {
      for (let i = arr.length; i--; ) {
        const child = Array.isArray(arr[i]) ? arr[i].join("") : arr[i];
        if (typeof child === "string") {
          str += child[0] !== "<" ? esc(child) : child;
        }
      }
    }
    str += tag ? `</${tag}>` : "";
  }
  return str;
}

export const Fragment = ({ children }) => h(null, null, children);
