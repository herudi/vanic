// src/diff.js
function getAttr(node, attr) {
  return node.getAttribute ? node.getAttribute(attr) : "";
}
function getNodeContent(node, attr) {
  if (attr) {
    if (typeof node[attr] === "string") {
      if (attr !== "href")
        return node[attr];
    }
    return getAttr(node, attr);
  }
  if (node.childNodes && node.childNodes.length > 0)
    return null;
  return node.textContent;
}
function diff(template, elem) {
  const domNodes = elem.childNodes;
  const templateNodes = template.childNodes;
  let count = domNodes.length - templateNodes.length;
  if (count > 0) {
    for (; count > 0; count--) {
      domNodes[domNodes.length - count].parentNode.removeChild(
        domNodes[domNodes.length - count]
      );
    }
  }
  templateNodes.forEach((node, index) => {
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
          const nm = attr.name;
          const tpl = getNodeContent(node, nm);
          const tplDom = getNodeContent(domNodes[index], nm);
          if (tpl !== tplDom) {
            if (nm in domNodes[index])
              domNodes[index][nm] = tpl;
            else
              domNodes[index].setAttribute?.(nm, tpl);
          }
        }
        i++;
      }
    }
    if (node.nodeType !== domNodes[index].nodeType || node.tagName !== domNodes[index].tagName || getAttr(node, "style") !== getAttr(domNodes[index], "style")) {
      domNodes[index].parentNode.replaceChild(
        node.cloneNode(true),
        domNodes[index]
      );
      return;
    }
    const templateContent = getNodeContent(node);
    if (templateContent && templateContent !== getNodeContent(domNodes[index])) {
      domNodes[index].textContent = templateContent;
    }
    if (domNodes[index].childNodes.length > 0 && node.childNodes.length < 1) {
      domNodes[index].innerHTML = "";
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

// src/index.js
var IS_BROWSER = typeof document !== "undefined";
var reRender;
var reElem;
var fno = [];
var idx = 0;
var cid = 0;
var fidx = 0;
var firsts = [];
var lasts = [];
var curHook;
var curComp = {};
var uid = 0;
var dangerHTML = "dangerouslySetInnerHTML";
var isFunc = (val) => typeof val === "function";
var getSelector = (key, id) => reElem.querySelector(`[c-${key}="${id}"]`);
var hasChange = (old, next) => !old || next.some((dep, x) => dep !== old[x]);
var hasContext = () => curHook && curHook.t.length;
function runEffect(hook) {
  if (hook) {
    hook.y.splice(0).forEach(invokeEffect);
    if (hook.e.length)
      setTimeout(() => hook.e.splice(0).forEach(invokeEffect));
  }
}
var isValidElement = (elem) => typeof elem === "object" && elem.type && elem.props;
function renderToString(child) {
  if (isFunc(child))
    child = child();
  if (typeof child !== "object" || !child) {
    return child;
  }
  if (child._t)
    child = child._t();
  const toArray = (res2) => {
    const arr = [];
    for (let i = 0; i < res2.length; i++) {
      arr.push(renderToString(res2[i]));
    }
    if (hasContext())
      curHook.t = [];
    return arr.flat().join("");
  };
  if (Array.isArray(child))
    return toArray(child);
  if (child && child.props === void 0)
    return child;
  const res = comp(child.type)(child.props);
  if (res && res.props !== void 0)
    return renderToString(res);
  if (Array.isArray(res))
    return toArray(res);
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
      if ($)
        $[key] = value;
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
function render(fn, target) {
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
var buildCallback = (status, isMemo) => (val, deps) => {
  if (!reElem)
    return isMemo ? val() : void 0;
  const { i, s, e, y } = curHook;
  if (!deps)
    deps = s.map((el) => el.st).filter((el) => el !== void 0);
  const isFirst = i >= s.length;
  if (isFirst)
    s[i] = { d: deps, v: val, f: false };
  if (isFirst || s[i].f || hasChange(s[i].d, deps)) {
    if (isMemo)
      s[i] = { v: val(), d: deps };
    else
      (status ? e : y).push(s[i]);
  }
  curHook.i++;
  if (isMemo)
    return s[i].v;
  s[i].v = val;
  s[i].d = deps;
  s[i].f = false;
};
function useState(value) {
  const { s, i } = curHook;
  const st = s[i] === void 0 ? value : s[i].st;
  if (i >= s.length)
    s.push({ st });
  curHook.i++;
  return [
    st,
    (newVal) => {
      s[i].st = isFunc(newVal) ? newVal(st) : newVal;
      _render(reRender);
    },
    () => s[i].st
  ];
}
function useReducer(reducer, init, initLazy) {
  const arr = useState(initLazy !== void 0 ? initLazy(init) : init);
  return [arr[0], (action) => arr[1](reducer(arr[0], action))];
}
var useEffect = buildCallback(1);
var useLayoutEffect = buildCallback(0);
var useMemo = buildCallback(1, 1);
var useCallback = (cb, deps) => useMemo(() => cb, deps);
var useRef = (current) => useMemo(() => ({ current, ref: () => current }), []);
var createContext = (init) => {
  const i = cid++;
  return {
    Provider({ value, children }) {
      if (curHook)
        curHook.t[i] = value !== void 0 ? value : init;
      return children;
    },
    i
  };
};
var useContext = (ctx) => curHook ? curHook.t[ctx.i] : void 0;
var useId = (s) => (s || ":") + uid++;
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
function comp(fn) {
  initFunc(fn);
  const { i, m } = fn;
  uid = m;
  const c = "" + m + (fn.name || fn.toString().length) + i;
  const init = curComp[c] || { s: [], i: 0, e: [], y: [], t: [] };
  fn.i++;
  return (p) => {
    if (hasContext())
      init.t = curHook.t;
    curHook = init;
    init.i = 0;
    const res = renderToString(fn(p === void 0 ? {} : p));
    if (!curComp[c])
      curComp[c] = init;
    firsts.push({ c, fn });
    return res;
  };
}
function html(ret) {
  const subs = [].slice.call(arguments, 1);
  return ret.reduce((start, end, no) => {
    let val = subs[no - 1];
    if (val === null || val === void 0)
      val = "";
    if (Array.isArray(val))
      val = val.join("");
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
function h(type, props) {
  props || (props = {});
  type || (type = "");
  if (type._t)
    type = type._t();
  const children = [].slice.call(arguments, 2).map((el) => typeof el === "number" ? String(el) : el).filter(Boolean);
  if (children.length)
    props.children = children.flat();
  if (isFunc(type)) {
    initFunc(type);
    return { type, props, key: void 0 };
  }
  let str = `<${type}`;
  for (let k in props) {
    let val = props[k];
    if (k === "className")
      k = "class";
    if (reElem && (val === void 0 || val === null))
      val = "";
    if (val !== void 0 && val !== null && k !== dangerHTML && k !== "children") {
      const type2 = typeof val;
      if (type2 === "function" || type2 === "boolean" || type2 === "object") {
        const value = val;
        const key = k.toLowerCase();
        if (type2 === "object" && key !== "ref") {
          str += ` ${k}="${Object.keys(val).reduce(
            (a, b) => a + b.split(/(?=[A-Z])/).join("-").toLowerCase() + ":" + (typeof val[b] === "number" ? val[b] + "px" : val[b]) + ";",
            ""
          )}"`;
        } else if (reElem) {
          const id = idx++;
          if (key === "ref") {
            val.ref = () => getSelector(key, id);
          }
          fno[id] = { key, value };
          str += ` c-${key}="${id}"`;
        } else if (val === true)
          str += ` ${k}`;
        else if (val === false)
          str += "";
      } else
        str += ` ${k}="${val}"`;
    }
  }
  str += ">";
  if (/area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr/.test(
    type
  )) {
    return { type, props, key: void 0, _t: () => str };
  }
  if (props[dangerHTML]) {
    str += props[dangerHTML].__html;
  } else {
    for (let i = 0; i < children.length; i++) {
      const child = renderToString(children[i]);
      if (typeof child === "string")
        str += child;
    }
  }
  str += type ? `</${type}>` : "";
  return { type, props, key: void 0, _t: () => str };
}
var Fragment = ({ children }) => children;
h.Fragment = Fragment;
export {
  Fragment,
  IS_BROWSER,
  comp,
  createContext,
  h,
  html,
  isValidElement,
  render,
  renderToString,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState
};
