// CREDIT & ORIGINAL: https://gomakethings.com/dom-diffing-with-vanilla-js
// Add diff attribute
const isVanicAttr = (a) => a[0] === 'c' && a[1] === '-';
function isNotMatch(node, dom) {
  return (
    node.nodeType !== dom.nodeType ||
    node.tagName !== dom.tagName ||
    node.id !== dom.id ||
    node.src !== dom.src ||
    getAttr(node, 'c-f') !== getAttr(dom, 'c-f')
  );
}
function getAttr(node, attr) {
  if (!node.getAttribute) return '';
  return node.getAttribute(attr);
}
function getNodeContent(node, attr) {
  if (attr) {
    if (attr === 'href' || attr === 'van-link' || isVanicAttr(attr))
      return getAttr(node, attr);
    if (typeof node[attr] !== 'string') return getAttr(node, attr);
    return node[attr];
  }
  if (node.childNodes && node.childNodes.length > 0) return null;
  return node.textContent;
}
function diff(template, elem) {
  const domNodes = Array.prototype.slice.call(elem.childNodes);
  const templateNodes = Array.prototype.slice.call(template.childNodes);
  let count = domNodes.length - templateNodes.length;
  if (count > 0) {
    for (; count > 0; count--) {
      domNodes[domNodes.length - count].parentNode.removeChild(
        domNodes[domNodes.length - count]
      );
    }
  }
  templateNodes.forEach(function (node, index) {
    if (!domNodes[index]) {
      elem.appendChild(node.cloneNode(true));
      return;
    }

    if (node.attributes && node.attributes.length) {
      let i = 0;
      const len = node.attributes.length;
      while (i < len) {
        const attr = node.attributes[i];
        if (attr.name) {
          const tpl = getNodeContent(node, attr.name) || '';
          const tplDom = getNodeContent(domNodes[index], attr.name) || '';
          if (tpl !== tplDom) {
            let nm = attr.name;
            if (isVanicAttr(nm)) {
              if (nm !== 'c-f') {
                if (domNodes[index].setAttribute) {
                  domNodes[index].setAttribute(nm, tpl);
                }
              }
            } else {
              if (nm === 'class') nm = 'className';
              else if (nm === 'for') nm = 'htmlFor';
              domNodes[index][nm] = tpl;
            }
          }
        }
        i++;
      }
    }
    if (isNotMatch(node, domNodes[index])) {
      domNodes[index].parentNode.replaceChild(
        node.cloneNode(true),
        domNodes[index]
      );
      return;
    }
    const templateContent = getNodeContent(node);
    if (
      templateContent &&
      templateContent !== getNodeContent(domNodes[index])
    ) {
      domNodes[index].textContent = templateContent;
    }
    if (domNodes[index].childNodes.length > 0 && node.childNodes.length < 1) {
      domNodes[index].innerHTML = '';
      return;
    }
    if (domNodes[index].childNodes.length < 1 && node.childNodes.length > 0) {
      const fragment = document.createDocumentFragment();
      diff(node, fragment);
      domNodes[index].appendChild(fragment);
      return;
    }
    if (node.childNodes.length > 0) {
      diff(node, domNodes[index]);
    }
  });
}

let reRender;
let reElem;
let fno = [];
let rep = {};
let primObject = {};
let idx = 0;
let hid = 0;
let curComp;

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

function _render(fn) {
  const res = fn();
  const elem = document.createElement('div');
  elem.innerHTML = res;
  diff(elem, reElem);
  if (reRender) {
    const obj = Object.assign({}, primObject);
    const arr = reElem.querySelectorAll('[c-f]');
    let j = arr.length;
    while (j--) {
      const el = arr[j];
      if (el.getAttribute) {
        const attr = el.getAttribute('c-f');
        if (obj[attr]) obj[attr] = undefined;
      }
    }
    for (const key in obj) {
      if (obj[key]) cleanEffect(obj[key]);
    }
  }
  reRender = fn;
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
}

function html(ret) {
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
      if (!key.includes('>') && !key.includes('<')) {
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

function renderToString(fn) {
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

function render(fn, elem) {
  reRender = undefined;
  fno = [];
  idx = 0;
  hid = 0;
  reElem = elem;
  _render(fn);
}
const comp = (fn) => {
  const id = hid++;
  const hook = (__C.hook = { i: 0, e: [], y: [], s: [] });
  function __C(p) {
    const prev = curComp;
    curComp = __C;
    hook.i = 0;
    let res = fn(p === undefined ? {} : p);
    if (typeof res === 'string') {
      if (!/<.*>/.test(res)) res = `<notag>${res}</notag>`;
      res = res.replace(/>/, ` c-f="${id}">`);
      primObject[`${id}`] = curComp;
    }
    if (prev) curComp = prev;
    if (hook.e.length) setTimeout(() => hook.e.splice(0).forEach(invoveEffect));
    hook.y.splice(0).forEach(invoveEffect);
    return res;
  }
  return __C;
};

// useState
function useState(value) {
  const { s, i } = curComp.hook;
  const val = s[i] === undefined ? value : s[i].val;
  if (i >= s.length) s.push({ val });
  curComp.hook.i++;
  return [
    val,
    (newVal) => {
      s[i].val = typeof newVal === 'function' ? newVal(val) : newVal;
      _render(reRender);
    },
  ];
}

const hasChange = (old, next) =>
  !old || old.length !== next.length || next.some((dep, x) => dep !== old[x]);

function runCleanup(effect) {
  if (typeof effect.clean === 'function') {
    effect.clean();
    effect.clean = undefined;
  }
}

function invoveEffect(effect) {
  runCleanup(effect);
  effect.clean = effect.val();
}

const cleanEffect = (c) => {
  if (c.hook && c.hook.s) {
    setTimeout(
      c.hook.s.forEach((effect) => {
        runCleanup(effect);
        effect.sync = true;
      })
    );
  }
};

const buildEffect = (status) => (val, deps) => {
  if (!reElem) return;
  const { i, s, e, y } = curComp.hook;
  const isOk = i >= s.length;
  if (isOk) s[i] = { deps, val, sync: false };
  if (isOk || s[i].sync || hasChange(s[i].deps, deps)) {
    (status ? e : y).push(s[i]);
  }
  s[i].val = val;
  s[i].deps = deps;
  s[i].sync = false;
  curComp.hook.i++;
};

// useEffect
const useEffect = buildEffect(true);

// useLayoutEffect
const useLayoutEffect = buildEffect(false);

// useReducer
function useReducer(reducer, init, initLazy) {
  const arr = useState(initLazy !== undefined ? initLazy(init) : init);
  return [
    arr[0],
    (action) => {
      arr[1](reducer(arr[0], action));
    },
  ];
}

// useMemo
function useMemo(fn, deps) {
  if (!reElem) return fn();
  const { i, s } = curComp.hook;
  if (i >= s.length || hasChange(s[i].deps, deps)) {
    s[i] = { val: fn(), deps };
  }
  curComp.hook.i++;
  return s[i].val;
}

// useCallback
const useCallback = (cb, deps) => useMemo(() => (p) => cb(p), deps);

// useRef
const useRef = (current) =>
  useMemo(() => ({ current, ref: () => current }), []);

// createContext
const createContext = (init) => {
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
const useContext = (c) => {
  return c.v();
};

// CREDIT & ORIGINAL https://github.com/developit/vhtml
// Add event, ref and style as object.
const dangerHTML = 'dangerouslySetInnerHTML';
function h(tag, attr) {
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

const Fragment = ({ children }) => h(null, null, children);

export { Fragment, _render, comp, createContext, h, html, render, renderToString, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState };
