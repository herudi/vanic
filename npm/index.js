var Vanic = (function (exports) {
  'use strict';

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
  let fno = [];
  let idx = 0;
  let sid = 0;
  let hooks = [];
  let cleans = [];

  function _render(fn) {
    const res = fn();
    reRender = fn;
    const elem = document.createElement("div");
    elem.innerHTML = res;
    diff(elem, reElem);
    let i = fno.length;
    while (i--) {
      const { key, value } = fno[i];
      const $ = document.querySelector(`[_v${(typeof value)[0]}="${i}"]`);
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
    return ret.reduce((a, b, c) => {
      let val = subs[c - 1];
      if (val === null || val === undefined) val = "";
      const type = typeof val;
      if (type === "function" || type === "boolean" || type === "object") {
        const id = `${idx++}`;
        const arr = a.split(" ");
        const value = val;
        const attr = `_v${type[0]}="${id}`;
        const key = (arr[arr.length - 1] || "").replace(/=|"/g, "");
        fno[id] = { key, value };
        a = arr.slice(0, -1).join(" ") + ` ${attr}`;
        val = "";
      }
      return a + String(val) + b;
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
        if (reRender) _render(reRender);
      },
    ];
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

  exports.html = html;
  exports.render = render;
  exports.useEffect = useEffect;
  exports.useState = useState;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
