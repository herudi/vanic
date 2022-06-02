// CREDIT & ORIGINAL: https://gomakethings.com/dom-diffing-with-vanilla-js
// Add diff attribute
function getNodeType(node) {
  if (node.nodeType === 3) return "text";
  if (node.nodeType === 8) return "comment";
  return node.tagName.toLowerCase();
}
function getAttr(node, attr) {
  return node.getAttribute(attr);
}
function getNodeContent(node, attr) {
  if (attr) {
    if (attr === "href" || attr === "van-link" || attr.startsWith("c-"))
      return getAttr(node, attr);
    if (typeof node[attr] !== "string") return getAttr(node, attr);
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
    const type = getNodeType(node);
    const domType = getNodeType(domNodes[index]);
    if (type !== domType) {
      domNodes[index].parentNode.replaceChild(
        node.cloneNode(true),
        domNodes[index]
      );
      return;
    }
    if (node.attributes && node.attributes.length) {
      let i = 0;
      const len = node.attributes.length;
      while (i < len) {
        const attr = node.attributes[i];
        if (attr.name) {
          const tpl = getNodeContent(node, attr.name) || "";
          const tplDom = getNodeContent(domNodes[index], attr.name) || "";
          if (tpl !== tplDom) {
            let nm = attr.name;
            if (nm.startsWith("class")) nm = "className";
            if (nm.endsWith("for")) nm = "htmlFor";
            if (nm.startsWith("c-")) {
              domNodes[index].setAttribute(nm, tpl);
            } else {
              domNodes[index][nm] = tpl;
            }
          }
        }
        i++;
      }
    }
    const templateContent = getNodeContent(node);
    if (
      templateContent &&
      templateContent !== getNodeContent(domNodes[index])
    ) {
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

function useEffect(cb, deps) {
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

function html(ret) {
  const subs = [].slice.call(arguments, 1);
  return ret.reduce((start, end, no) => {
    let val = subs[no - 1];
    if (val === null || val === undefined) val = "";
    if (Array.isArray(val)) val = val.join("");
    const type = typeof val;
    if (type === "function" || type === "boolean" || type === "object") {
      const id = `${idx++}`;
      const arr = start.split(" ");
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

function useState(val) {
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

function renderToString(fn) {
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

function render(fn, elem) {
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

export { html, render, renderToString, useEffect, useState };
