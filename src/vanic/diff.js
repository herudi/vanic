// CREDIT & ORIGINAL: https://gomakethings.com/dom-diffing-with-vanilla-js
// Add diff attribute
const isVanicAttr = (a) => a[0] === 'c' && a[1] === '-';
function isNotMatch(node, dom) {
  return (
    node.nodeType !== dom.nodeType ||
    node.tagName !== dom.tagName ||
    node.id !== dom.id ||
    node.src !== dom.src ||
    getAttr(node, 'c-comp') !== getAttr(dom, 'c-comp')
  );
}
function getAttr(node, attr) {
  if (!node.getAttribute) return '';
  return node.getAttribute(attr);
}
function getNodeContent(node, attr) {
  if (attr) {
    if (attr === 'href' || isVanicAttr(attr)) return getAttr(node, attr);
    if (typeof node[attr] !== 'string') return getAttr(node, attr);
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
              if (nm !== 'c-comp') {
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
