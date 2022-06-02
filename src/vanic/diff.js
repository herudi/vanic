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
export function diff(template, elem) {
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
