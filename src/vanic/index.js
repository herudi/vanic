import { diff } from './diff.js';

function filteredArray(arr1, arr2) {
  const newArr = Object.assign([], arr1);
  arr2.forEach((v) => {
    let i = newArr.indexOf(v);
    if (i >= 0) {
      newArr.splice(i, 1);
    }
  });
  return newArr;
}
const regFindComp = /(?<=c-comp=")(.*?)(?=")/gm;
let reRender;
let reElem;
let fno = [];
let rep = {};
let primObject = {};
let idx = 0;
let hid = 0;
let curComp;
let lastRes;
const sto = setTimeout;

function esc(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
const styleToString = (style) => {
  return Object.keys(style).reduce(
    (acc, key) =>
      acc +
      key
        .split(/(?=[A-Z])/)
        .join('-')
        .toLowerCase() +
      ':' +
      style[key] +
      ';',
    ''
  );
};

export function _render(fn) {
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
  const arr = res.match(regFindComp) || [];
  const initArr = lastRes ? lastRes.match(regFindComp) || [] : arr;
  lastRes = res;
  if (reRender && arr.length !== initArr.length) {
    const effects = filteredArray(arr, initArr);
    const cleanEffects = filteredArray(initArr, arr);
    cleanEffects.forEach((k) => {
      const cmp = primObject[k];
      if (cmp) cleanEffect(cmp);
    });
    effects.forEach((k) => {
      const cmp = primObject[k];
      if (cmp) {
        const { hook } = cmp;
        hook.y.splice(0);
        hook.e.splice(0);
        if (hook.s.length)
          sto(() => hook.s.forEach((effect) => invoveEffect(effect, true)));
      }
    });
  }
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
  return (typeof fn === 'string' ? fn : fn()).replace(/ c-.*="\d+"/g, (a) => {
    const arr = (a || '').split(' ');
    let str = '';
    for (let i = 0; i < arr.length; i++) {
      const ret = rep[arr[i]];
      if (ret) {
        const { key, value } = ret;
        const type = typeof value;
        if (type === 'object' && key !== 'ref') {
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
  _render(fn);
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
    }
    if (prev) curComp = prev;
    if (reRender) {
      if (hook.e.length) sto(() => hook.e.splice(0).forEach(invoveEffect));
    } else {
      if (hook.s.length)
        sto(() => {
          hook.e.splice(0);
          hook.s.forEach(invoveEffect);
        });
    }
    if (hook.y.length) hook.y.splice(0).forEach(invoveEffect);
    return res;
  }
  return __C;
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
  ];
}

const hasChange = (old, next) =>
  !old || old.length !== next.length || next.some((dep, x) => dep !== old[x]);

function runCleanup(effect) {
  if (typeof effect.clean === 'function') effect.clean();
}

function invoveEffect(effect, i) {
  if (typeof i !== 'boolean') {
    runCleanup(effect);
    effect.clean = undefined;
  }
  if (typeof effect.val === 'function') {
    sto(() => (effect.clean = effect.val()));
  }
}

const cleanEffect = (c) => {
  if (c.hook) sto(() => c.hook.s.forEach(runCleanup));
};

const buildEffect = (status) => (val, deps) => {
  if (!reElem) return;
  const { i, s, e, y } = curComp.hook;
  if (!deps) deps = s.map((el) => el.state).filter(Boolean);
  const isOk = i >= s.length;
  if (isOk) s[i] = { deps, val };
  if (isOk || hasChange(s[i].deps, deps)) {
    (status ? e : y).push(s[i]);
  }
  s[i].val = val;
  s[i].deps = deps;
  curComp.hook.i++;
};

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
const dangerHTML = 'dangerouslySetInnerHTML';
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
            str += ` ${k}="${esc(val)}"`;
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
          str += child[0] !== '<' ? esc(child) : child;
        }
      }
    }
    str += tag ? `</${tag}>` : '';
  }
  return str;
}

export const Fragment = ({ children }) => html(null, null, children);
