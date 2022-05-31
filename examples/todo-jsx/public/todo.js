 (() => new EventSource("/esbuild").onmessage = () => location.reload())();
(() => {
  // node_modules/vanic/index.esm.js
  function getNodeType(node) {
    if (node.nodeType === 3)
      return "text";
    if (node.nodeType === 8)
      return "comment";
    return node.tagName.toLowerCase();
  }
  function getAttr(node, attr) {
    return node.getAttribute(attr);
  }
  function getNodeContent(node, attr) {
    if (attr) {
      if (attr === "href" || attr === "van-link")
        return getAttr(node, attr);
      if (typeof node[attr] !== "string")
        return getAttr(node, attr);
      return node[attr];
    }
    if (node.childNodes && node.childNodes.length > 0)
      return null;
    return node.textContent;
  }
  function diff(template, elem) {
    const domNodes = Array.prototype.slice.call(elem.childNodes);
    const templateNodes = Array.prototype.slice.call(template.childNodes);
    let count = domNodes.length - templateNodes.length;
    if (count > 0) {
      for (; count > 0; count--) {
        domNodes[domNodes.length - count].parentNode.removeChild(domNodes[domNodes.length - count]);
      }
    }
    templateNodes.forEach(function(node, index) {
      if (!domNodes[index]) {
        elem.appendChild(node.cloneNode(true));
        return;
      }
      const type = getNodeType(node);
      const domType = getNodeType(domNodes[index]);
      if (type !== domType) {
        domNodes[index].parentNode.replaceChild(node.cloneNode(true), domNodes[index]);
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
              if (nm.startsWith("class"))
                nm = "className";
              if (nm.endsWith("for"))
                nm = "htmlFor";
              domNodes[index][nm] = tpl;
            }
          }
          i++;
        }
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
  var reRender;
  var reElem;
  var fno = {};
  var rep = {};
  var idx = 0;
  var sid = 0;
  var hooks = [];
  var cleans = [];
  var styleToString = (style) => {
    return Object.keys(style).reduce((acc, key) => acc + key.split(/(?=[A-Z])/).join("-").toLowerCase() + ":" + style[key] + ";", "");
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
          for (const s in act)
            $[k.toLowerCase()][s] = act[s];
        } else
          $[k.toLowerCase()] = act;
      }
    }
    idx = 0;
    sid = 0;
    fno = {};
    return res;
  }
  function useState(val) {
    const id = sid;
    sid++;
    return [
      hooks[id] === void 0 ? val : hooks[id],
      (newVal) => {
        hooks[id] = newVal;
        if (reRender)
          _render(reRender);
      }
    ];
  }
  function render(fn, elem) {
    reRender = void 0;
    reElem = void 0;
    fno = {};
    idx = 0;
    sid = 0;
    hooks = [];
    cleans = [];
    if (!elem) {
      return fn().replace(/ _v[o|f|b]="\d+"/g, (a) => {
        const arr = rep[a.substring(1)];
        if (arr === void 0)
          return "";
        const type = typeof arr[1];
        if (type === "object")
          return ` ${arr[0]}="${styleToString(arr[1])}"`;
        if (type === "boolean" && arr[1] === true)
          return ` ${arr[0]}`;
        return "";
      });
    }
    reElem = elem;
    return _render(fn);
  }
  var emptyTags = [
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
    "wbr"
  ];
  var esc = (str) => String(str).replace(/[&<>"']/g, (s) => `&${map[s]};`);
  var map = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos" };
  var setInnerHTMLAttr = "dangerouslySetInnerHTML";
  var DOMAttributeNames = {
    className: "class",
    htmlFor: "for"
  };
  var sanitized = {};
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
            const name2 = i;
            fno[name2] = fno[name2] || {};
            fno[name2][id] = value;
            i = `_v${type[0]}`;
            val = id;
            if (type !== "function")
              rep[`${i}="${val}"`] = [name2, value];
          }
          if (val !== false && val !== null && val !== void 0 && i !== setInnerHTMLAttr && i !== "") {
            s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(val)}"`;
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
              for (let i = child.length; i--; )
                stack.push(child[i]);
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
  var Fragment = ({ children }) => h("", null, children);

  // src/list.jsx
  var List = ({ items, onDelete }) => {
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("table", null, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, "ID"), /* @__PURE__ */ h("th", null, "Name"), /* @__PURE__ */ h("th", null, "Act"))), /* @__PURE__ */ h("tbody", null, items.map((item, id) => {
      return /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("td", null, id + 1), /* @__PURE__ */ h("td", null, item.name), /* @__PURE__ */ h("td", null, /* @__PURE__ */ h("button", {
        onClick: () => onDelete(item.key)
      }, "delete")));
    }))));
  };

  // src/index.jsx
  function App() {
    const [items, setItems] = useState([]);
    const [itemText, setItemText] = useState("");
    const addItems = (e) => {
      e.preventDefault();
      setItems([...items, {
        key: Date.now().toString(),
        name: itemText
      }]);
      setItemText("");
    };
    const deleteItems = (key) => {
      const newItems = items.filter((el) => el.key !== key);
      setItems(newItems);
    };
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("h1", null, "Todo List App"), /* @__PURE__ */ h("form", {
      onSubmit: addItems
    }, /* @__PURE__ */ h("input", {
      value: itemText,
      onChange: (e) => setItemText(e.target.value),
      placeholder: "Todo enter"
    }), /* @__PURE__ */ h("button", {
      onClick: addItems,
      type: "submit"
    }, "Add")), items.length !== 0 && /* @__PURE__ */ h(List, {
      items,
      onDelete: deleteItems
    }));
  }
  render(App, document.getElementById("app"));
})();
