import { diff } from "./diff.js";

export const IS_BROWSER = typeof document !== "undefined";
let reRender;
let reElem;
let fno = [];
let idx = 0;
let cid = 0;
let fidx = 0;
let firsts = [];
let lasts = [];
let curHook;
let curComp = {};
let uid = 0;
const dangerHTML = "dangerouslySetInnerHTML";
const isFunc = (val) => typeof val === "function";
const getSelector = (key, id) => reElem.querySelector(`[c-${key}="${id}"]`);
const hasChange = (old, next) => !old || next.some((dep, x) => dep !== old[x]);
const hasContext = () => curHook && curHook.t.length;

function runEffect(hook) {
  if (hook) {
    hook.y.splice(0).forEach(invokeEffect);
    if (hook.e.length) setTimeout(() => hook.e.splice(0).forEach(invokeEffect));
  }
}

export const isValidElement = (elem) =>
  typeof elem === "object" && elem.type && elem.props;

export function renderToString(child) {
  if (isFunc(child)) child = child();
  if (typeof child !== "object" || !child) {
    return child;
  }
  if (child._t) child = child._t();
  const toArray = (res) => {
    const arr = [];
    for (let i = 0; i < res.length; i++) {
      arr.push(renderToString(res[i]));
    }
    if (hasContext()) curHook.t = [];
    return arr.flat().join("");
  };
  if (Array.isArray(child)) return toArray(child);
  if (child && child.props === void 0) return child;
  const res = comp(child.type)(child.props);
  if (res && res.props !== void 0) return renderToString(res);
  if (Array.isArray(res)) return toArray(res);
  return res;
}
function _render(fn) {
  const res = comp(fn.type ? fn.type : fn)(fn.props);
  const elem = document.createElement("div");
  elem.innerHTML = res;
  diff(elem, reElem);
  fno.forEach((o, i) => {
    const { key, value } = o;
    if (key !== "ref") {
      const $ = getSelector(key, i);
      if ($) $[key] = value;
    }
  });
  const mapFirsts = firsts.map((el) => el.c);
  lasts.forEach((o) => {
    if (mapFirsts.indexOf(o.c) === -1 && curComp[o.c]) {
      curComp[o.c].s.forEach((e) => runCleanup(e, true));
      curComp[o.c] = void 0;
    }
  });
  firsts.forEach((o) => {
    runEffect(curComp[o.c]);
    o.fn.i = 0;
  });
  lasts = firsts;
  firsts = [];
  fno = [];
  idx = 0;
  reRender = fn;
}

function runCleanup(effect, force) {
  if (isFunc(effect.c)) {
    effect.c();
    effect.c = void 0;
    effect.f = force;
  }
}
function invokeEffect(effect) {
  runCleanup(effect);
  effect.c = effect.v();
}

export function render(fn, target) {
  curHook = void 0;
  reRender = void 0;
  curComp = {};
  lasts = [];
  firsts = [];
  fno = [];
  idx = 0;
  cid = 0;
  fidx = 0;
  uid = 0;
  reElem = target;
  _render(fn);
}

const buildCallback = (status, isMemo) => (val, deps) => {
  if (!reElem) return isMemo ? val() : void 0;
  const { i, s, e, y } = curHook;
  // skip every render.
  if (!deps) deps = s.map((el) => el.st).filter((el) => el !== void 0);
  const isFirst = i >= s.length;
  if (isFirst) s[i] = { d: deps, v: val, f: false };
  if (isFirst || s[i].f || hasChange(s[i].d, deps)) {
    if (isMemo) s[i] = { v: val(), d: deps };
    else (status ? e : y).push(s[i]);
  }
  curHook.i++;
  if (isMemo) return s[i].v;
  s[i].v = val;
  s[i].d = deps;
  s[i].f = false;
};

// useState
export function useState(value) {
  const { s, i } = curHook;
  const st = s[i] === void 0 ? value : s[i].st;
  if (i >= s.length) s.push({ st });
  curHook.i++;
  return [
    st,
    (newVal) => {
      s[i].st = isFunc(newVal) ? newVal(st) : newVal;
      _render(reRender);
    },
    () => s[i].st,
  ];
}

// useReducer
export function useReducer(reducer, init, initLazy) {
  const arr = useState(initLazy !== void 0 ? initLazy(init) : init);
  return [arr[0], (action) => arr[1](reducer(arr[0], action))];
}

// useEffect
export const useEffect = buildCallback(1);

// useLayoutEffect
export const useLayoutEffect = buildCallback(0);

// useMemo
export const useMemo = buildCallback(1, 1);

// useCallback
export const useCallback = (cb, deps) => useMemo(() => cb, deps);

// useRef
export const useRef = (current) =>
  useMemo(() => ({ current, ref: () => current }), []);

// createContext
export const createContext = (init) => {
  const i = cid++;
  return {
    Provider({ value, children }) {
      if (curHook) curHook.t[i] = value !== void 0 ? value : init;
      return children;
    },
    i,
  };
};

// useContext
export const useContext = (ctx) => curHook ? curHook.t[ctx.i] : void 0;

// useId
export const useId = (s) => (s || ":") + (uid++);

function initFunc(fn) {
  if (fn.i === void 0) {
    fn.i = 0;
    fn.m = IS_BROWSER ? fidx++ : 0;
  } else {
    if (reElem === void 0) {
      fn.i = 0;
    }
  }
}

export function comp(fn) {
  initFunc(fn);
  const { i, m } = fn;
  uid = m;
  const c = "" + m + (fn.name || fn.toString().length) + i;
  const init = curComp[c] || { s: [], i: 0, e: [], y: [], t: [] };
  fn.i++;
  return (p) => {
    if (hasContext()) init.t = curHook.t;
    curHook = init;
    init.i = 0;
    const res = renderToString(fn(p === void 0 ? {} : p));
    if (!curComp[c]) curComp[c] = init;
    firsts.push({ c, fn });
    return res;
  };
}

export function html(ret) {
  const subs = [].slice.call(arguments, 1);
  return ret.reduce((start, end, no) => {
    let val = subs[no - 1];
    if (val === null || val === void 0) val = "";
    if (Array.isArray(val)) val = val.join("");
    const type = typeof val;
    if (type === "function" || type === "boolean" || type === "object") {
      const arr = start.match(/[^ ]+/g) || [];
      const value = val;
      const key = (arr[arr.length - 1] || "").replace(/=|"/g, "").toLowerCase();
      const id = idx++;
      const attr = `c-${key}="${id}`;
      if (key === "ref") {
        val.ref = () => reElem.querySelector(`[${attr}"]`);
      }
      fno[id] = { key, value };
      start = arr.slice(0, -1).join(" ") + ` ${attr}`;
      val = "";
    }
    return start + String(val) + end;
  });
}
export function h(type, props) {
  props ||= {};
  type ||= "";
  if (type._t) type = type._t();
  const children = [].slice
    .call(arguments, 2)
    .map((el) => (typeof el === "number" ? String(el) : el))
    .filter(Boolean);
  if (children.length) props.children = children.flat();
  if (isFunc(type)) {
    initFunc(type);
    return { type, props, key: void 0 };
  }
  let str = `<${type}`;
  for (let k in props) {
    let val = props[k];
    if (k === "className") k = "class";
    if (reElem && (val === void 0 || val === null)) val = "";
    if (
      val !== void 0 &&
      val !== null &&
      k !== dangerHTML &&
      k !== "children"
    ) {
      const type = typeof val;
      if (type === "function" || type === "boolean" || type === "object") {
        const value = val;
        const key = k.toLowerCase();
        if (type === "object" && key !== "ref") {
          str += ` ${k}="${
            Object.keys(val).reduce(
              (a, b) =>
                a +
                b
                  .split(/(?=[A-Z])/)
                  .join("-")
                  .toLowerCase() +
                ":" +
                (typeof val[b] === "number" ? val[b] + "px" : val[b]) +
                ";",
              "",
            )
          }"`;
        } else if (reElem) {
          const id = idx++;
          if (key === "ref") {
            val.ref = () => getSelector(key, id);
          }
          fno[id] = { key, value };
          str += ` c-${key}="${id}"`;
        } else if (val === true) str += ` ${k}`;
        else if (val === false) str += "";
      } else str += ` ${k}="${val}"`;
    }
  }
  str += ">";
  if (
    /area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr/
      .test(
        type,
      )
  ) {
    return { type, props, key: void 0, _t: () => str };
  }
  if (props[dangerHTML]) {
    str += props[dangerHTML].__html;
  } else {
    for (let i = 0; i < children.length; i++) {
      const child = renderToString(children[i]);
      if (typeof child === "string") str += child;
    }
  }
  str += type ? `</${type}>` : "";
  return { type, props, key: void 0, _t: () => str };
}

export const Fragment = ({ children }) => children;
h.Fragment = Fragment;
