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
    if (attr === "href" || attr === "van-link") return getAttr(node, attr);
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
            domNodes[index][nm] = tpl;
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
let fno = {};
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
  for (const k in fno) {
    const name = fno[k];
    for (const l in name) {
      const act = name[l];
      const $ = document.querySelector(`[_v${(typeof act)[0]}="${l}"]`);
      if (typeof act === "object") {
        for (const s in act) $[k.toLowerCase()][s] = act[s];
      } else $[k.toLowerCase()] = act;
    }
  }
  idx = 0;
  sid = 0;
  fno = {};
  return res;
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
  return ret.reduce((a, b, c) => {
    let val = subs[c - 1];
    if (val === null || val === undefined) val = "";
    const type = typeof val;
    if (type === "function" || type === "boolean" || type === "object") {
      const id = `${idx++}`;
      const arr = a.split(" ");
      const value = val;
      const attr = `_v${type[0]}="${id}`;
      const name = (arr[arr.length - 1] || "").replace(/=|"/g, "");
      fno[name] = fno[name] || {};
      fno[name][id] = value;
      if (type !== "function") rep[`${attr}"`] = [name, value];
      a = arr.slice(0, -1).join(" ") + ` ${attr}`;
      val = "";
    }
    return a + String(val) + b;
  });
}

function useState(val) {
  const id = sid;
  sid++;
  return [
    hooks[id] === undefined ? val : hooks[id],
    (newVal) => {
      hooks[id] = newVal;
      if (reRender) _render(reRender);
    },
  ];
}

function render(fn, elem) {
  reRender = undefined;
  reElem = undefined;
  fno = {};
  idx = 0;
  sid = 0;
  hooks = [];
  cleans = [];
  if (!elem) {
    return fn().replace(/ _v[o|f|b]="\d+"/g, (a) => {
      const arr = rep[a.substring(1)];
      if (arr === undefined) return "";
      const type = typeof arr[1];
      if (type === "object") return ` ${arr[0]}="${styleToString(arr[1])}"`;
      if (type === "boolean" && arr[1] === true) return ` ${arr[0]}`;
      return "";
    });
  }
  reElem = elem;
  return _render(fn);
}

// CREDIT & ORIGINAL https://github.com/developit/vhtml
// Add event onclick, onchange etc. and support style object.
const emptyTags = [
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
];
const esc = (str) => String(str).replace(/[&<>"']/g, (s) => `&${map[s]};`);
const map = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos" };
const setInnerHTMLAttr = "dangerouslySetInnerHTML";
const DOMAttributeNames = {
  className: "class",
  htmlFor: "for",
};
const sanitized = {};
function h(name, attrs) {
  const stack = [];
  let s = "";
  attrs = attrs || {};
  for (let i = arguments.length; i-- > 2; ) {
    const arg = arguments[i];
    stack.push(typeof arg === "number" ? String(arg) : arg);
  }
  if (typeof name === "function") {
    attrs.children = stack.reverse();
    return name(attrs);
  }
  if (name) {
    s += "<" + name;
    if (attrs) {
      for (let i in attrs) {
        let val = attrs[i];
        const type = typeof val;
        if (type === "function" || type === "boolean" || type === "object") {
          const id = `${idx++}`;
          const value = val;
          const name = i;
          fno[name] = fno[name] || {};
          fno[name][id] = value;
          i = `_v${type[0]}`;
          val = id;
          if (type !== "function") rep[`${i}="${val}"`] = [name, value];
        }
        if (
          val !== false &&
          val !== null &&
          val !== undefined &&
          i !== setInnerHTMLAttr &&
          i !== ""
        ) {
          s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(
            val
          )}"`;
        }
      }
    }
    s += ">";
  }
  if (emptyTags.indexOf(name) === -1) {
    if (attrs[setInnerHTMLAttr]) {
      s += attrs[setInnerHTMLAttr].__html;
    } else {
      while (stack.length) {
        const child = stack.pop();
        if (child) {
          if (child.pop) {
            for (let i = child.length; i--; ) stack.push(child[i]);
          } else {
            s += sanitized[child] === true ? child : esc(child);
          }
        }
      }
    }
    s += name ? `</${name}>` : "";
  }
  sanitized[s] = true;
  return s;
}

const Fragment = ({ children }) => h("", null, children);

export { Fragment, h, html, render, useEffect, useState };
