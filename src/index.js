import {
  filteredArray,
  hasChange,
  removeAttributes,
  escHTML,
  sto,
  cleanEffect,
  invoveEffect,
  runEffectFromStates,
} from './utils.js';
import { diff } from './diff.js';

let reRender;
let reElem;
let fno = [];
let rep = {};
let idx = 0;
let hid = 0;
let curComp;
let primIndex = 0;
let lastRes;
let lastFn;
const primObject = {};
const dangerHTML = 'dangerouslySetInnerHTML';

function _render(fn) {
  const res = fn();
  const elem = document.createElement('div');
  elem.innerHTML = res;
  diff(elem, reElem);
  let i = fno.length;
  while (i--) {
    const obj = fno[i];
    const value = obj.value;
    const key = obj.key.toLowerCase();
    if (key !== 'ref') {
      const $ = reElem.querySelector(`[c-${key}="${i}"]`);
      if ($) {
        if (typeof value === 'object') {
          for (const s in value) $[key][s] = value[s];
        } else {
          $[key] = value;
        }
      }
    }
  }
  idx = 0;
  fno = [];
  const check = reElem.querySelectorAll('[c-comp]');
  if (reRender && check.length !== primIndex) {
    const arr = Array.prototype.map.call(
      check,
      (el) => el.getAttribute && el.getAttribute('c-comp')
    );
    const initArr = lastRes.match(/(?<=c-comp=")(.*?)(?=")/gm) || [];
    filteredArray(initArr, arr).forEach((k) => {
      const cmp = primObject[k];
      if (cmp) cleanEffect(cmp);
    });
    filteredArray(arr, initArr).forEach((k) => {
      const cmp = primObject[k];
      if (cmp) {
        const { hook } = cmp;
        hook.y.splice(0);
        hook.e.splice(0);
        runEffectFromStates(hook.s, true);
      }
    });
    primIndex = arr.length;
  }
  lastRes = res;
  reRender = fn;
}

export function html(ret) {
  const subs = [].slice.call(arguments, 1);
  return ret.reduce((start, end, no) => {
    let val = subs[no - 1];
    if (val === null || val === undefined) val = '';
    if (Array.isArray(val)) val = val.join('');
    const type = typeof val;
    if (type === 'function' || type === 'boolean' || type === 'object') {
      const arr = start.match(/[^ ]+/g);
      const value = val;
      const key = (arr[arr.length - 1] || '').replace(/=|"/g, '').toLowerCase();
      if (!/<|>/.test(key)) {
        const id = idx++;
        const attr = `c-${key}="${id}`;
        if (key === 'ref') {
          val.ref = () => document.querySelector(`[${attr}"]`);
        }
        fno[id] = { key, value };
        if (type !== 'function') rep[`${attr}"`] = { key, value };
        start = arr.slice(0, -1).join(' ') + ` ${attr}`;
      }
      val = '';
    }
    return start + String(val) + end;
  });
}

export function renderToString(fn) {
  return removeAttributes(fn, rep);
}

export function render(fn, elem) {
  reRender = undefined;
  lastRes = undefined;
  fno = [];
  rep = {};
  idx = 0;
  reElem = elem;
  _render(typeof fn === 'function' ? fn : lastFn);
}
export const comp = (fn) => {
  const hook = (__C.hook = { i: 0, e: [], y: [], s: [] });
  const id = hid++;
  function __C(p) {
    const prev = curComp;
    curComp = __C;
    hook.i = 0;
    let res = fn(p === undefined ? {} : p);
    if (typeof res === 'string') {
      if (!/<.*>/.test(res)) res = `<notag>${res}</notag>`;
      res = res.replace(/>/, ` c-comp="${id}">`);
      primObject[`${id}`] = curComp;
      if (!reRender) primIndex++;
    }
    if (prev) curComp = prev;
    if (!lastFn) lastFn = curComp;
    if (reRender) {
      if (hook.e.length) sto(() => hook.e.splice(0).forEach(invoveEffect));
      if (hook.y.length) hook.y.splice(0).forEach(invoveEffect);
    } else runEffectFromStates(hook.s);
    return res;
  }
  return __C;
};

const buildEffect = (status) => (val, deps) => {
  if (!reElem) return;
  const { i, s, e, y } = curComp.hook;
  if (!deps) deps = s.map((el) => el.state).filter(Boolean);
  const isOk = i >= s.length;
  if (isOk) s[i] = { deps, val, status };
  if (reRender && (isOk || hasChange(s[i].deps, deps))) {
    (status ? e : y).push(s[i]);
  }
  s[i].val = val;
  s[i].deps = deps;
  s[i].status = status;
  curComp.hook.i++;
};

// useState
export function useState(value) {
  const { s, i } = curComp.hook;
  const state = s[i] === undefined ? value : s[i].state;
  if (i >= s.length) s.push({ state });
  curComp.hook.i++;
  return [
    state,
    (newVal) => {
      s[i].state = typeof newVal === 'function' ? newVal(state) : newVal;
      _render(reRender);
    },
    () => s[i].state,
  ];
}

// useEffect
export const useEffect = buildEffect(true);

// useLayoutEffect
export const useLayoutEffect = buildEffect(false);

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
  const { i, s } = curComp.hook;
  if (!deps) deps = s.map((el) => el.state).filter(Boolean);
  if (i >= s.length || hasChange(s[i].deps, deps)) {
    s[i] = { val: fn(), deps };
  }
  curComp.hook.i++;
  return s[i].val;
}

// useCallback
export const useCallback = (cb, deps) => useMemo(() => cb, deps);

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
export function h(tag, attr) {
  const args = [].slice.call(arguments, 2);
  const arr = [];
  let str = '';
  attr = attr || {};
  for (let i = args.length; i--; ) {
    arr.push(typeof args[i] === 'number' ? String(args[i]) : args[i]);
  }
  if (typeof tag === 'function') {
    attr.children = arr.reverse();
    return tag(attr);
  }
  if (tag) {
    str += `<${tag}`;
    if (attr) {
      for (let k in attr) {
        if (k !== 'children') {
          let val = attr[k];
          const type = typeof val;
          if (type === 'function' || type === 'boolean' || type === 'object') {
            const value = val;
            const key = k.toLowerCase();
            const id = idx++;
            if (key === 'ref') {
              val.ref = () => document.querySelector(`[c-${id}="${id}"]`);
            }
            fno[id] = { key, value };
            k = `c-${key}`;
            val = id;
            if (type !== 'function') rep[`${k}="${val}"`] = { key, value };
          }
          if (
            val !== undefined &&
            val !== false &&
            val !== null &&
            k !== dangerHTML
          ) {
            str += ` ${k}="${escHTML(val)}"`;
          }
        }
      }
    }
    str += '>';
  }
  if (
    [
      'area',
      'base',
      'br',
      'col',
      'command',
      'embed',
      'hr',
      'img',
      'input',
      'keygen',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ].indexOf(tag) === -1
  ) {
    if (attr[dangerHTML]) {
      str += attr[dangerHTML].__html;
    } else {
      for (let i = arr.length; i--; ) {
        const child = Array.isArray(arr[i]) ? arr[i].join('') : arr[i];
        if (typeof child === 'string') {
          str += child[0] !== '<' ? escHTML(child) : child;
        }
      }
    }
    str += tag ? `</${tag}>` : '';
  }
  return str;
}

export const Fragment = ({ children }) => html(null, null, children);
