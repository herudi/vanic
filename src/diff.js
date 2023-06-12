// FROM: https://gomakethings.com/dom-diffing-with-vanilla-js

function getAttr(node, attr) {
  return node.getAttribute ? node.getAttribute(attr) : '';
}
function getNodeContent(node, attr) {
  if (attr) {
    if (typeof node[attr] === 'string') {
      if (attr !== 'href') return node[attr];
    }
    return getAttr(node, attr);
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
            if (nm in domNodes[index]) domNodes[index][nm] = tpl;
            else domNodes[index].setAttribute?.(nm, tpl);
          }
        }
        i++;
      }
    }
    if (
      node.nodeType !== domNodes[index].nodeType ||
      node.tagName !== domNodes[index].tagName ||
      getAttr(node, 'style') !== getAttr(domNodes[index], 'style')
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
