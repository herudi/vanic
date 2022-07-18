// CREDIT & ORIGINAL: https://gomakethings.com/dom-diffing-with-vanilla-js
// Add diff attribute
function withTry(cb) {
  try {
    cb();
  } catch (_e) {
    /* noop */
  }
}
function getAttr(node, attr) {
  if (!node.getAttribute) return '';
  return node.getAttribute(attr);
}
function getNodeContent(node, attr) {
  if (attr) {
    if (attr === 'href' || (attr[0] === 'c' && attr[1] === '-'))
      return getAttr(node, attr);
    if (typeof node[attr] !== 'string') return getAttr(node, attr);
    return node[attr];
  }
  if (node.childNodes && node.childNodes.length > 0) return null;
  return node.textContent;
}
export function diff(template, elem) {
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
      const newNode = node.cloneNode(true);
      elem.appendChild(newNode);
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
            if (nm === 'class') nm = 'className';
            else if (nm === 'for') nm = 'htmlFor';
            withTry(() => domNodes[index].setAttribute(nm, tpl));
            withTry(() => (domNodes[index][nm] = tpl));
          }
        }
        i++;
      }
    }
    if (
      node.nodeType !== domNodes[index].nodeType ||
      node.tagName !== domNodes[index].tagName ||
      getAttr(node, 'c-comp') !== getAttr(domNodes[index], 'c-comp')
    ) {
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
