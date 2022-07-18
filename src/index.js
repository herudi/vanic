import { diff } from './diff.js';

let reRender;
let reElem;
let fno = [];
let primeObj = {};
let idx = 0;
let cid = 0;
let firsts = [];
let lasts = [];
let curHook;
const dangerHTML = 'dangerouslySetInnerHTML';
const sto = setTimeout;
const isFunc = (val) => typeof val === 'function';
const getSelector = (key, id) => reElem.querySelector(`[c-${key}="${id}"]`);
const hasChange = (old, next) => !old || next.some((dep, x) => dep !== old[x]);

function runEffect(hook) {
  if (hook) {
    hook.y.splice(0).forEach(invokeEffect);
    if (hook.e.length) sto(() => hook.e.splice(0).forEach(invokeEffect));
  }
}

export function renderToString(child) {
  if (isFunc(child)) child = child();
  if (child === undefined) return child;
  const toArray = (res) => {
    const arr = [];
    for (let i = 0; i < res.length; i++) {
      arr.push(renderToString(res[i]));
    }
    return arr.flat().join('');
  };
  if (Array.isArray(child)) return toArray(child);
  if (typeof child === 'string') return child;
  // const runComp =
  //   child.comp.name === 'Fragment' || child.comp.name === 'Provider' ? child.comp : comp(child.comp);
  const res = comp(child.comp)(child.props);
  if (res.__c) return renderToString(res);
  if (Array.isArray(res)) return toArray(res);
  return res;
}

function _render(fn, c) {
  const res = comp(fn.comp)(fn.props);
  const elem = document.createElement('div');
  elem.innerHTML = res;
  diff(elem, reElem);
  fno.forEach((o, i) => {
    const { key, value } = o;
    if (key !== 'ref') {
      const $ = getSelector(key, i);
      if ($) $[key] = value;
    }
  });
  lasts.forEach(
    (k) =>
      firsts.indexOf(k) === -1 &&
      primeObj[k].s.forEach((e) => runCleanup(e, true))
  );
  firsts.forEach((k) => {
    if (c) {
      if (c[0] <= k[0]) runEffect(primeObj[k]);
      else {
        primeObj[k].e.splice(0);
        primeObj[k].y.splice(0);
      }
    } else runEffect(primeObj[k]);
  });
  idx = 0;
  cid = 0;
  lasts = firsts;
  firsts = [];
  fno = [];
  reRender = fn;
}

function runCleanup(effect, force) {
  if (isFunc(effect.c)) {
    effect.c();
    effect.c = undefined;
    effect.f = force;
  }
}
function invokeEffect(effect) {
  runCleanup(effect);
  effect.c = effect.v();
}

export function render(fn, elem) {
  curHook = undefined;
  reRender = undefined;
  primeObj = {};
  lasts = [];
  firsts = [];
  fno = [];
  idx = 0;
  cid = 0;
  reElem = elem;
  _render(fn.__c ? fn : h(fn));
}

const buildEffect = (status) => (val, deps) => {
  if (!reElem) return;
  const { i, s, e, y } = curHook;
  const isFirst = i >= s.length;
  if (isFirst) s[i] = { d: deps, v: val, f: false };
  if (isFirst || s[i].f || hasChange(s[i].d, deps)) {
    (status ? e : y).push(s[i]);
  }
  s[i].v = val;
  s[i].d = deps;
  s[i].f = false;
  curHook.i++;
};

// useState
export function useState(value) {
  const { s, i, c } = curHook;
  const st = s[i] === undefined ? value : s[i].st;
  if (i >= s.length) s.push({ st });
  curHook.i++;
  return [
    st,
    (newVal) => {
      s[i].st = isFunc(newVal) ? newVal(st) : newVal;
      _render(reRender, c);
    },
    () => s[i].st,
  ];
}

// useReducer
export function useReducer(reducer, init, initLazy) {
  const arr = useState(initLazy !== undefined ? initLazy(init) : init);
  return [arr[0], (action) => arr[1](reducer(arr[0], action))];
}

// useEffect
export const useEffect = buildEffect(true);

// useLayoutEffect
export const useLayoutEffect = buildEffect(false);

// useMemo
export function useMemo(fn, deps) {
  if (!reElem) return fn();
  const { i, s } = curHook;
  if (i >= s.length || !deps || hasChange(s[i].d, deps)) {
    s[i] = { v: fn(), d: deps };
  }
  curHook.i++;
  return s[i].v;
}

// useCallback
export const useCallback = (cb, deps) => useMemo(() => cb, deps);

// useRef
export const useRef = (current) =>
  useMemo(() => ({ current, ref: () => current }), []);

// createContext
export const createContext = (init) => {
  let val;
  return {
    Provider({ value, children }) {
      val = value !== undefined ? value : init;
      return children;
    },
    v: () => val,
  };
};

// useContext
export const useContext = (c) => c.v();

function comp(fn) {
  const c = cid++ + '-' + (fn.name || 'main').toLowerCase();
  const init = primeObj[c] || { s: [], i: 0, e: [], y: [], c };
  function _C(p) {
    curHook = init;
    curHook.i = 0;
    let res = fn(p);
    if (res.__c) res = renderToString(res);
    if (typeof res === 'string' && reElem !== undefined) {
      res = res.replace(/>/, ` c-comp="${c}">`);
    }
    if (!primeObj[c]) primeObj[c] = init;
    firsts.push(c);
    return res;
  }
  return _C;
}

// CREDIT & ORIGINAL https://github.com/developit/vhtml
// Add event, ref and style as object.
export function h(tag, props) {
  const args = [].slice.call(arguments, 2);
  const arr = [];
  let str = '',
    i = args.length;
  props = props || {};
  while (i--) {
    if (args[i] !== false) {
      arr.push(typeof args[i] === 'number' ? String(args[i]) : args[i]);
    }
  }
  if (isFunc(tag)) {
    props.children = arr.reverse();
    return { comp: tag, props, __c: true };
  }
  if (tag) {
    str += `<${tag}`;
    if (props) {
      for (let k in props) {
        const val = props[k];
        if (
          val !== undefined &&
          val !== null &&
          k !== dangerHTML &&
          k !== 'children'
        ) {
          const type = typeof val;
          if (type === 'function' || type === 'boolean' || type === 'object') {
            const value = val;
            const key = k.toLowerCase();
            if (type === 'object' && key !== 'ref') {
              str += ` ${k}="${Object.keys(val).reduce(
                (a, b) =>
                  a +
                  b
                    .split(/(?=[A-Z])/)
                    .join('-')
                    .toLowerCase() +
                  ':' +
                  val[b] +
                  ';',
                ''
              )}"`;
            } else if (reElem) {
              const id = idx++;
              if (key === 'ref') {
                val.ref = () => getSelector(key, id);
              }
              fno[id] = { key, value };
              str += ` c-${key}="${id}"`;
            } else if (val === true) str += ` ${k}`;
            else if (val === false) str += '';
          } else str += ` ${k}="${val}"`;
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
    if (props[dangerHTML]) {
      str += props[dangerHTML].__html;
    } else {
      let j = arr.length;
      while (j--) {
        const child = renderToString(arr[j]);
        if (typeof child === 'string') str += child;
      }
    }
    str += tag ? `</${tag}>` : '';
  }
  return str;
}

export const Fragment = ({ children }) => children;
